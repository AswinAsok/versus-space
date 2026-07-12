const MAX_BODY_BYTES = 100_000;
const TIMESTAMP_TOLERANCE_SECONDS = 5 * 60;

type JsonObject = Record<string, unknown>;

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

function object(value: unknown): JsonObject | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

function decodeBase64(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const decoded = atob(normalized);
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
}

async function rawBody(request: Request) {
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_BODY_BYTES) return null;
  if (!request.body) return '';

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

async function validSignature(request: Request, body: string, secret: string) {
  const id = request.headers.get('webhook-id');
  const timestampHeader = request.headers.get('webhook-timestamp');
  const signatures = request.headers.get('webhook-signature');
  if (
    !id ||
    id.length > 200 ||
    id.includes('.') ||
    !timestampHeader ||
    !/^\d{10}$/.test(timestampHeader) ||
    !signatures ||
    signatures.length > 8_192
  ) {
    return false;
  }

  const timestamp = Number(timestampHeader);
  if (Math.abs(Date.now() / 1_000 - timestamp) > TIMESTAMP_TOLERANCE_SECONDS) return false;
  if (!secret.startsWith('whsec_')) throw new Error('Invalid Dodo webhook secret format');

  const key = await crypto.subtle.importKey(
    'raw',
    decodeBase64(secret.slice('whsec_'.length)),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const signedContent = new TextEncoder().encode(`${id}.${timestampHeader}.${body}`);

  for (const signature of signatures.split(/\s+/)) {
    const separator = signature.indexOf(',');
    if (separator === -1 || signature.slice(0, separator) !== 'v1') continue;
    try {
      if (
        await crypto.subtle.verify(
          'HMAC',
          key,
          decodeBase64(signature.slice(separator + 1)),
          signedContent
        )
      ) {
        return true;
      }
    } catch {
      // Ignore malformed signature candidates; another rotated signature may still be valid.
    }
  }
  return false;
}

function paymentData(payload: JsonObject) {
  const data = object(payload.data);
  return object(data?.object) ?? data;
}

function metadataUserId(payment: JsonObject) {
  const metadata = object(payment.metadata);
  if (!metadata) return null;
  for (const key of ['userId', 'user_id', 'userid', 'user']) {
    const value = metadata[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function customerEmail(payment: JsonObject) {
  const email = object(payment.customer)?.email;
  return typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null;
}

function paymentId(payment: JsonObject) {
  return typeof payment.payment_id === 'string' && payment.payment_id ? payment.payment_id : null;
}

function includesProduct(payment: JsonObject, productId: string) {
  if (payment.product_id === productId) return true;
  if (!Array.isArray(payment.product_cart)) return false;
  return payment.product_cart.some((item) => object(item)?.product_id === productId);
}

async function profileForPayment(env: Env, payment: JsonObject) {
  const userId = metadataUserId(payment);
  if (userId) {
    const profile = await env.DB.prepare('SELECT user_id FROM user_profiles WHERE user_id = ?')
      .bind(userId)
      .first<{ user_id: string }>();
    if (profile) return profile.user_id;
  }

  const email = customerEmail(payment);
  if (!email) return null;
  const profile = await env.DB.prepare(
    'SELECT user_id FROM user_profiles WHERE lower(email) = ? LIMIT 1'
  )
    .bind(email)
    .first<{ user_id: string }>();
  return profile?.user_id ?? null;
}

function isDuplicateWebhook(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('UNIQUE constraint failed: dodo_webhook_events');
}

export async function handleDodoWebhook(request: Request, env: Env) {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  }
  if (!env.DODO_WEBHOOK_KEY) {
    console.error(JSON.stringify({ message: 'Dodo webhook secret is not configured' }));
    return json({ error: 'Webhook is not configured' }, 503);
  }

  const body = await rawBody(request);
  if (body === null) return json({ error: 'Request body is too large' }, 413);

  let verified: boolean;
  try {
    verified = await validSignature(request, body, env.DODO_WEBHOOK_KEY);
  } catch (error) {
    console.error(
      JSON.stringify({
        message: 'Dodo webhook verification configuration failed',
        error: error instanceof Error ? error.message : String(error),
      })
    );
    return json({ error: 'Webhook is not configured' }, 503);
  }
  if (!verified) return json({ error: 'Invalid webhook signature' }, 401);

  let payload: JsonObject;
  try {
    const parsed = JSON.parse(body) as unknown;
    const parsedObject = object(parsed);
    if (!parsedObject) throw new Error('Webhook body must be an object');
    payload = parsedObject;
  } catch {
    return json({ error: 'Invalid webhook payload' }, 400);
  }

  const eventId = request.headers.get('webhook-id')!;
  const eventType = payload.type;
  if (typeof eventType !== 'string' || eventType.length > 100) {
    return json({ error: 'Invalid webhook event type' }, 400);
  }
  if (eventType !== 'payment.succeeded') {
    return json({ received: true, ignored: true });
  }

  const payment = paymentData(payload);
  if (!payment) return json({ error: 'Invalid payment payload' }, 400);
  if (!includesProduct(payment, env.DODO_PRO_PRODUCT_ID)) {
    return json({ received: true, ignored: true });
  }
  const currentPaymentId = paymentId(payment);
  if (!currentPaymentId) return json({ error: 'Payment ID is required' }, 400);

  const userId = await profileForPayment(env, payment);
  if (!userId) return json({ error: 'Payment user was not found' }, 422);

  const processedAt = new Date().toISOString();
  try {
    await env.DB.batch([
      env.DB.prepare(
        "UPDATE user_profiles SET plan = 'pro', updated_at = ? WHERE user_id = ?"
      ).bind(processedAt, userId),
      env.DB.prepare(
        `INSERT INTO dodo_webhook_events
         (id, event_type, payment_id, user_id, processed_at)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(eventId, eventType, currentPaymentId, userId, processedAt),
    ]);
  } catch (error) {
    if (isDuplicateWebhook(error)) return json({ received: true, duplicate: true });
    throw error;
  }

  console.log(JSON.stringify({ message: 'Dodo payment applied', eventId, eventType, userId }));
  return json({ received: true, upgraded: true });
}
