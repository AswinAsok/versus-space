import { DODO_PAYMENTS_CONFIG } from '../config/plans';

interface CheckoutParams {
  email: string;
  userId: string;
  customerName?: string;
}

/**
 * Generates a DodoPayments checkout URL for the Pro plan
 * Uses static payment link with pre-filled customer info
 *
 * NOTE: UPI QR codes have a ~3-5 minute timeout (UPI infrastructure limitation).
 * We add unique identifiers to ensure each click creates a fresh payment session,
 * avoiding "requires_customer_action" errors from stale sessions.
 */
export function getProCheckoutUrl({ email, userId, customerName }: CheckoutParams): string {
  const { proProductId, checkoutBaseUrl, successUrl, cancelUrl } = DODO_PAYMENTS_CONFIG;

  // Generate unique reference with timestamp + random to force completely fresh checkout session
  // This prevents DodoPayments from reusing stale payment intents
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const uniqueRef = `${userId}_${timestamp}_${random}`;

  // Add timestamp to success/cancel URLs to prevent any caching
  const successWithTimestamp = `${successUrl}&t=${timestamp}`;
  const cancelWithTimestamp = `${cancelUrl}&t=${timestamp}`;

  const params = new URLSearchParams({
    redirect_url: successWithTimestamp,
    cancel_url: cancelWithTimestamp,
  });

  // Pass userId as metadata for webhook identification
  // DodoPayments uses metadata_ prefix format
  params.set('metadata_userId', userId);
  params.set('metadata_timestamp', timestamp.toString());

  // Add unique external_id to force new payment session (critical for UPI retry)
  params.set('external_id', uniqueRef);

  // Pre-fill customer info
  params.set('email', email);
  if (customerName) {
    params.set('name', customerName);
  }

  return `${checkoutBaseUrl}/${proProductId}?${params.toString()}`;
}

/**
 * Redirects user to DodoPayments checkout
 */
export function redirectToCheckout(params: CheckoutParams): void {
  const checkoutUrl = getProCheckoutUrl(params);
  window.location.href = checkoutUrl;
}
