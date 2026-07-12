import { handleDodoWebhook } from './dodo-webhook';

interface AuthUser {
  id: string;
  email: string | null;
}

interface PollRow {
  id: string;
  title: string;
  creator_id: string;
  is_active: number;
  created_at: string;
  updated_at: string;
  is_public: number;
  access_key: string | null;
  ends_at: string | null;
  max_votes_per_ip: number | null;
  auto_vote_interval_seconds: number;
  slug: string;
}

interface PollOptionRow {
  id: string;
  poll_id: string;
  title: string;
  image_url: string | null;
  vote_count: number;
  position: number;
  created_at: string;
  simulated_enabled: number;
  simulated_target_votes: number | null;
  simulated_votes_added: number;
}

interface UserProfileRow {
  user_id: string;
  email: string | null;
  plan: 'free' | 'pro';
  role: 'user' | 'superadmin';
  created_at: string;
  updated_at: string;
}

interface CreatePollInput {
  title: string;
  is_public: boolean;
  access_key: string | null;
  ends_at: string | null;
  max_votes_per_ip: number | null;
  auto_vote_interval_seconds: number;
  options: Array<{
    title: string;
    image_url: string | null;
    position: number;
    simulated_enabled: boolean;
    simulated_target_votes: number | null;
  }>;
}

interface UpdatePollInput {
  title?: string;
  is_active?: boolean;
  is_public?: boolean;
  access_key?: string | null;
  ends_at?: string | null;
  max_votes_per_ip?: number | null;
  auto_vote_interval_seconds?: number;
  options?: Array<{
    id: string;
    title: string;
    image_url: string | null;
    position: number;
    simulated_enabled: boolean;
    simulated_target_votes: number | null;
  }>;
}

class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
  }
}

const jsonHeaders = { 'Cache-Control': 'no-store' };

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: jsonHeaders });
}

function broadcastPoll(env: Env, ctx: ExecutionContext, pollId: string, message: unknown) {
  ctx.waitUntil(
    env.POLL_ROOMS.getByName(pollId)
      .broadcast(JSON.stringify(message))
      .catch((error) => console.error('Failed to broadcast poll event', error))
  );
}

function integer(value: unknown, fallback: number, min: number, max: number) {
  if (value === null || value === undefined || value === '') return fallback;
  if (!Number.isInteger(value) || Number(value) < min || Number(value) > max) {
    throw new ApiError(400, `Expected an integer between ${min} and ${max}`);
  }
  return Number(value);
}

function optionalString(value: unknown, maxLength: number) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string' || value.length > maxLength) {
    throw new ApiError(400, `Expected a string no longer than ${maxLength} characters`);
  }
  return value;
}

function requiredString(value: unknown, maxLength: number, name: string) {
  if (typeof value !== 'string' || !value.trim() || value.length > maxLength) {
    throw new ApiError(400, `${name} is required and must be at most ${maxLength} characters`);
  }
  return value.trim();
}

function optionalTimestamp(value: unknown) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) {
    throw new ApiError(400, 'Invalid timestamp');
  }
  return value;
}

function createPollInput(value: unknown): CreatePollInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ApiError(400, 'Invalid poll payload');
  }

  const input = value as Record<string, unknown>;
  if (!Array.isArray(input.options) || input.options.length < 2 || input.options.length > 20) {
    throw new ApiError(400, 'A poll must have between 2 and 20 options');
  }

  return {
    title: requiredString(input.title, 100, 'Poll title'),
    is_public: input.is_public !== false,
    access_key: optionalString(input.access_key, 200),
    ends_at: optionalTimestamp(input.ends_at),
    max_votes_per_ip:
      input.max_votes_per_ip === null || input.max_votes_per_ip === undefined
        ? null
        : integer(input.max_votes_per_ip, 0, 1, 1_000_000),
    auto_vote_interval_seconds: integer(input.auto_vote_interval_seconds, 30_000, 200, 300_000),
    options: input.options.map((value, index) => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new ApiError(400, `Invalid option at position ${index + 1}`);
      }
      const option = value as Record<string, unknown>;
      return {
        title: requiredString(option.title, 50, `Option ${index + 1}`),
        image_url: optionalString(option.image_url, 2_048),
        position: integer(option.position, index, 0, 19),
        simulated_enabled: option.simulated_enabled === true,
        simulated_target_votes:
          option.simulated_target_votes === null || option.simulated_target_votes === undefined
            ? null
            : integer(option.simulated_target_votes, 0, 0, 10_000_000),
      };
    }),
  };
}

function updatePollInput(value: unknown): UpdatePollInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ApiError(400, 'Invalid poll payload');
  }
  const input = value as Record<string, unknown>;
  const parsed: UpdatePollInput = {};

  if (input.title !== undefined) parsed.title = requiredString(input.title, 100, 'Poll title');
  if (input.is_active !== undefined) {
    if (typeof input.is_active !== 'boolean') throw new ApiError(400, 'Invalid poll status');
    parsed.is_active = input.is_active;
  }
  if (input.is_public !== undefined) {
    if (typeof input.is_public !== 'boolean') throw new ApiError(400, 'Invalid poll visibility');
    parsed.is_public = input.is_public;
  }
  if (input.access_key !== undefined) parsed.access_key = optionalString(input.access_key, 200);
  if (input.ends_at !== undefined) parsed.ends_at = optionalTimestamp(input.ends_at);
  if (input.max_votes_per_ip !== undefined) {
    parsed.max_votes_per_ip =
      input.max_votes_per_ip === null ? null : integer(input.max_votes_per_ip, 0, 1, 1_000_000);
  }
  if (input.auto_vote_interval_seconds !== undefined) {
    parsed.auto_vote_interval_seconds = integer(
      input.auto_vote_interval_seconds,
      30_000,
      200,
      300_000
    );
  }
  if (input.options !== undefined) {
    if (!Array.isArray(input.options) || input.options.length < 2 || input.options.length > 20) {
      throw new ApiError(400, 'A poll must have between 2 and 20 options');
    }
    parsed.options = input.options.map((value, index) => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new ApiError(400, `Invalid option at position ${index + 1}`);
      }
      const option = value as Record<string, unknown>;
      return {
        id: requiredString(option.id, 100, `Option ${index + 1} ID`),
        title: requiredString(option.title, 50, `Option ${index + 1}`),
        image_url: optionalString(option.image_url, 2_048),
        position: integer(option.position, index, 0, 19),
        simulated_enabled: option.simulated_enabled === true,
        simulated_target_votes:
          option.simulated_target_votes === null || option.simulated_target_votes === undefined
            ? null
            : integer(option.simulated_target_votes, 0, 0, 10_000_000),
      };
    });
  }

  if (Object.keys(parsed).length === 0) throw new ApiError(400, 'No poll changes provided');
  return parsed;
}

async function requestJson(request: Request) {
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > 100_000) throw new ApiError(413, 'Request body is too large');
  if (!request.body) throw new ApiError(400, 'JSON body required');

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > 100_000) {
      await reader.cancel();
      throw new ApiError(413, 'Request body is too large');
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
  } catch {
    throw new ApiError(400, 'Invalid JSON body');
  }
}

async function authenticatedUser(request: Request, env: Env): Promise<AuthUser> {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ') || !env.SUPABASE_ANON_KEY) {
    throw new ApiError(401, 'Authentication required');
  }

  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: authorization, apikey: env.SUPABASE_ANON_KEY },
  });
  if (!response.ok) throw new ApiError(401, 'Invalid or expired session');

  const value = (await response.json()) as { id?: unknown; email?: unknown };
  if (typeof value.id !== 'string') throw new ApiError(401, 'Invalid user response');
  return { id: value.id, email: typeof value.email === 'string' ? value.email : null };
}

function normalizedEmail(email: string | null) {
  return email?.trim().toLowerCase() ?? null;
}

function secretsMatch(left: string | null, right: string | null) {
  if (left === null || right === null) return false;
  const encoder = new TextEncoder();
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);
  if (leftBytes.byteLength !== rightBytes.byteLength) return false;
  return crypto.subtle.timingSafeEqual(leftBytes, rightBytes);
}

async function getOrCreateProfile(env: Env, user: AuthUser) {
  const email = normalizedEmail(user.email);
  const superadmins = env.SUPERADMIN_EMAILS.split(',').map((value) => value.trim().toLowerCase());
  const isSuperadmin = email !== null && superadmins.includes(email);
  const existing = await env.DB.prepare('SELECT * FROM user_profiles WHERE user_id = ?')
    .bind(user.id)
    .first<UserProfileRow>();

  if (existing) {
    if (
      existing.email !== email ||
      (isSuperadmin && (existing.role !== 'superadmin' || existing.plan !== 'pro'))
    ) {
      const now = new Date().toISOString();
      await env.DB.prepare(
        'UPDATE user_profiles SET email = ?, role = ?, plan = ?, updated_at = ? WHERE user_id = ?'
      )
        .bind(
          email,
          isSuperadmin ? 'superadmin' : existing.role,
          isSuperadmin ? 'pro' : existing.plan,
          now,
          user.id
        )
        .run();
      return env.DB.prepare('SELECT * FROM user_profiles WHERE user_id = ?')
        .bind(user.id)
        .first<UserProfileRow>();
    }
    return existing;
  }

  const now = new Date().toISOString();
  await env.DB.prepare(
    'INSERT INTO user_profiles (user_id, email, plan, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
  )
    .bind(
      user.id,
      email,
      isSuperadmin ? 'pro' : 'free',
      isSuperadmin ? 'superadmin' : 'user',
      now,
      now
    )
    .run();
  return env.DB.prepare('SELECT * FROM user_profiles WHERE user_id = ?')
    .bind(user.id)
    .first<UserProfileRow>();
}

function pollJson(poll: PollRow, options: PollOptionRow[], includeAccessKey = false) {
  return {
    ...poll,
    is_active: poll.is_active === 1,
    is_public: poll.is_public === 1,
    access_key: includeAccessKey ? poll.access_key : null,
    options: options.map((option) => ({
      ...option,
      simulated_enabled: option.simulated_enabled === 1,
    })),
  };
}

async function optionsForPolls(env: Env, pollIds: string[]) {
  if (pollIds.length === 0) return new Map<string, PollOptionRow[]>();
  const placeholders = pollIds.map(() => '?').join(', ');
  const { results } = await env.DB.prepare(
    `SELECT * FROM poll_options WHERE poll_id IN (${placeholders}) ORDER BY position`
  )
    .bind(...pollIds)
    .all<PollOptionRow>();
  const options = new Map<string, PollOptionRow[]>();
  for (const option of results) {
    const current = options.get(option.poll_id) ?? [];
    current.push(option);
    options.set(option.poll_id, current);
  }
  return options;
}

async function pollResponse(request: Request, env: Env, column: 'id' | 'slug', value: string) {
  const poll = await env.DB.prepare(`SELECT * FROM polls WHERE ${column} = ?`)
    .bind(value)
    .first<PollRow>();
  if (!poll) throw new ApiError(404, 'Poll not found');

  if (poll.is_public === 0) {
    const accessKey = request.headers.get('x-poll-access-key');
    if (!secretsMatch(accessKey, poll.access_key)) {
      return json({ ...pollJson(poll, []), requires_access: true });
    }
  }

  const options = await optionsForPolls(env, [poll.id]);
  return json(pollJson(poll, options.get(poll.id) ?? []));
}

async function ownerPollResponse(env: Env, pollId: string) {
  const poll = await env.DB.prepare('SELECT * FROM polls WHERE id = ?')
    .bind(pollId)
    .first<PollRow>();
  if (!poll) throw new ApiError(404, 'Poll not found');
  const options = await optionsForPolls(env, [pollId]);
  return json(pollJson(poll, options.get(pollId) ?? [], true));
}

function slug(title: string) {
  const base =
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50) || 'poll';
  return `${base}-${crypto.randomUUID().replaceAll('-', '').slice(0, 6)}`;
}

async function userPolls(request: Request, env: Env) {
  const user = await authenticatedUser(request, env);
  const { results } = await env.DB.prepare(
    'SELECT * FROM polls WHERE creator_id = ? ORDER BY created_at DESC'
  )
    .bind(user.id)
    .all<PollRow>();
  const options = await optionsForPolls(
    env,
    results.map((poll) => poll.id)
  );
  return json(results.map((poll) => pollJson(poll, options.get(poll.id) ?? [], true)));
}

async function createPoll(request: Request, env: Env) {
  const user = await authenticatedUser(request, env);
  const profile = await getOrCreateProfile(env, user);
  if (!profile) throw new ApiError(500, 'Failed to create profile');
  const input = createPollInput(await requestJson(request));
  const isPro = profile.plan === 'pro' || profile.role === 'superadmin';

  if (!isPro) {
    const count = await env.DB.prepare('SELECT COUNT(*) AS count FROM polls WHERE creator_id = ?')
      .bind(user.id)
      .first<{ count: number }>();
    if ((count?.count ?? 0) >= 3) throw new ApiError(403, 'Free plan poll limit reached');
  }

  const now = new Date();
  const pollId = crypto.randomUUID();
  const pollSlug = slug(input.title);
  const isPublic = isPro ? input.is_public : true;
  if (!isPublic && !input.access_key)
    throw new ApiError(400, 'Private polls require an access key');
  const endsAt = isPro ? input.ends_at : new Date(now.getTime() + 15 * 60_000).toISOString();
  const statements: D1PreparedStatement[] = [
    env.DB.prepare(
      `INSERT INTO polls
       (id, title, creator_id, is_active, created_at, updated_at, is_public, access_key, ends_at, max_votes_per_ip, auto_vote_interval_seconds, slug)
       VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      pollId,
      input.title,
      user.id,
      now.toISOString(),
      now.toISOString(),
      isPublic ? 1 : 0,
      isPublic ? null : input.access_key,
      endsAt,
      isPro ? input.max_votes_per_ip : null,
      isPro ? input.auto_vote_interval_seconds : 30_000,
      pollSlug
    ),
  ];

  for (const option of input.options) {
    statements.push(
      env.DB.prepare(
        `INSERT INTO poll_options
         (id, poll_id, title, image_url, vote_count, position, created_at, simulated_enabled, simulated_target_votes, simulated_votes_added)
         VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, 0)`
      ).bind(
        crypto.randomUUID(),
        pollId,
        option.title,
        option.image_url,
        option.position,
        now.toISOString(),
        isPro && option.simulated_enabled ? 1 : 0,
        isPro ? option.simulated_target_votes : null
      )
    );
  }

  await env.DB.batch(statements);
  return ownerPollResponse(env, pollId);
}

async function ownedPoll(request: Request, env: Env, pollId: string) {
  const user = await authenticatedUser(request, env);
  const profile = await getOrCreateProfile(env, user);
  if (!profile) throw new ApiError(500, 'Failed to load profile');
  const poll = await env.DB.prepare('SELECT * FROM polls WHERE id = ?')
    .bind(pollId)
    .first<PollRow>();
  if (!poll) throw new ApiError(404, 'Poll not found');
  if (poll.creator_id !== user.id && profile.role !== 'superadmin') {
    throw new ApiError(403, 'Poll ownership required');
  }
  return { poll, profile };
}

async function updatePoll(request: Request, env: Env, ctx: ExecutionContext, pollId: string) {
  const { poll, profile } = await ownedPoll(request, env, pollId);
  const input = updatePollInput(await requestJson(request));
  const isPro = profile.plan === 'pro' || profile.role === 'superadmin';
  const isPublic = input.is_public ?? poll.is_public === 1;
  if (!isPro && !isPublic) throw new ApiError(403, 'Private polls require Pro');

  const accessKey = isPublic ? null : (input.access_key ?? poll.access_key);
  if (!isPublic && !accessKey) throw new ApiError(400, 'Private polls require an access key');

  if (input.options) {
    const placeholders = input.options.map(() => '?').join(', ');
    const { results } = await env.DB.prepare(
      `SELECT id FROM poll_options WHERE poll_id = ? AND id IN (${placeholders})`
    )
      .bind(pollId, ...input.options.map((option) => option.id))
      .all<{ id: string }>();
    if (results.length !== input.options.length) {
      throw new ApiError(400, 'One or more options do not belong to this poll');
    }
  }

  const now = new Date().toISOString();
  const statements: D1PreparedStatement[] = [
    env.DB.prepare(
      `UPDATE polls SET
         title = ?, is_active = ?, is_public = ?, access_key = ?, ends_at = ?,
         max_votes_per_ip = ?, auto_vote_interval_seconds = ?, updated_at = ?
       WHERE id = ?`
    ).bind(
      input.title ?? poll.title,
      (input.is_active ?? poll.is_active === 1) ? 1 : 0,
      isPublic ? 1 : 0,
      accessKey,
      isPro ? (input.ends_at === undefined ? poll.ends_at : input.ends_at) : poll.ends_at,
      isPro
        ? input.max_votes_per_ip === undefined
          ? poll.max_votes_per_ip
          : input.max_votes_per_ip
        : null,
      isPro ? (input.auto_vote_interval_seconds ?? poll.auto_vote_interval_seconds) : 30_000,
      now,
      pollId
    ),
  ];

  for (const option of input.options ?? []) {
    statements.push(
      env.DB.prepare(
        `UPDATE poll_options SET
           title = ?, image_url = ?, position = ?, simulated_enabled = ?, simulated_target_votes = ?
         WHERE id = ? AND poll_id = ?`
      ).bind(
        option.title,
        option.image_url,
        option.position,
        isPro && option.simulated_enabled ? 1 : 0,
        isPro ? option.simulated_target_votes : null,
        option.id,
        pollId
      )
    );
  }

  await env.DB.batch(statements);
  broadcastPoll(env, ctx, pollId, { type: 'refresh', pollId });
  return ownerPollResponse(env, pollId);
}

async function deletePoll(request: Request, env: Env, ctx: ExecutionContext, pollId: string) {
  await ownedPoll(request, env, pollId);
  await env.DB.prepare('DELETE FROM polls WHERE id = ?').bind(pollId).run();
  broadcastPoll(env, ctx, pollId, { type: 'deleted', pollId });
  return new Response(null, { status: 204 });
}

async function leaderboard(env: Env, url: URL) {
  const limit = integer(Number(url.searchParams.get('limit') ?? 10), 10, 1, 50);
  const { results } = await env.DB.prepare(
    `SELECT p.*
     FROM polls p
     LEFT JOIN poll_options po ON po.poll_id = p.id
     WHERE p.is_public = 1 AND p.is_active = 1
     GROUP BY p.id
     ORDER BY COALESCE(SUM(po.vote_count), 0) DESC
     LIMIT ?`
  )
    .bind(limit)
    .all<PollRow>();
  const options = await optionsForPolls(
    env,
    results.map((poll) => poll.id)
  );

  return json(
    results.map((poll) => {
      const pollOptions = options.get(poll.id) ?? [];
      return {
        ...pollJson(poll, pollOptions),
        total_votes: pollOptions.reduce((total, option) => total + option.vote_count, 0),
      };
    })
  );
}

async function platformStats(env: Env) {
  const stats = await env.DB.prepare(
    'SELECT polls_count, votes_count FROM platform_stats WHERE id = 1'
  ).first<{ polls_count: number; votes_count: number }>();
  return json({
    pollsCount: stats?.polls_count ?? 0,
    votesCount: stats?.votes_count ?? 0,
  });
}

async function mostRecentPoll(env: Env) {
  const poll = await env.DB.prepare(
    'SELECT * FROM polls WHERE is_public = 1 AND is_active = 1 ORDER BY created_at DESC LIMIT 1'
  ).first<PollRow>();
  if (!poll) return json(null);
  const options = await optionsForPolls(env, [poll.id]);
  const pollOptions = options.get(poll.id) ?? [];
  return json({
    ...pollJson(poll, pollOptions),
    total_votes: pollOptions.reduce((total, option) => total + option.vote_count, 0),
  });
}

async function proUserCount(env: Env) {
  const row = await env.DB.prepare(
    "SELECT COUNT(*) AS count FROM user_profiles WHERE plan = 'pro' AND role != 'superadmin'"
  ).first<{ count: number }>();
  return json(row?.count ?? 0);
}

async function analyticsSummary(request: Request, env: Env, url: URL) {
  const user = await authenticatedUser(request, env);
  const days = integer(Number(url.searchParams.get('days') ?? 30), 30, 1, 365);
  const timezoneOffset = integer(
    Number(url.searchParams.get('tzOffsetMinutes') ?? 0),
    0,
    -720,
    840
  );
  const start = new Date();
  if (days === 1) {
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() - 23);
  } else {
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));
  }
  start.setSeconds(0, 0);

  const format = days === 1 ? '%Y-%m-%d-%H' : '%Y-%m-%d';
  const modifier = `${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset} minutes`;
  const [pollTotals, votesOverTime, authenticity] = await env.DB.batch([
    env.DB.prepare(
      `SELECT p.id AS poll_id, p.title AS poll_title, COALESCE(SUM(po.vote_count), 0) AS total_votes
       FROM polls p
       LEFT JOIN poll_options po ON po.poll_id = p.id
       WHERE p.creator_id = ?
       GROUP BY p.id, p.title
       ORDER BY p.created_at DESC`
    ).bind(user.id),
    env.DB.prepare(
      `SELECT vc.poll_id,
              strftime(?, datetime(vc.minute_start, ?)) AS time_bucket,
              SUM(vc.real_votes + vc.simulated_votes) AS vote_count
       FROM vote_counts_minute vc
       JOIN polls p ON p.id = vc.poll_id
       WHERE p.creator_id = ? AND julianday(vc.minute_start) >= julianday(?)
       GROUP BY vc.poll_id, time_bucket
       ORDER BY time_bucket`
    ).bind(format, modifier, user.id, start.toISOString()),
    env.DB.prepare(
      `SELECT COALESCE(SUM(po.vote_count), 0) AS total_votes,
              COALESCE(SUM(po.simulated_votes_added), 0) AS simulated_votes
       FROM poll_options po
       JOIN polls p ON p.id = po.poll_id
       WHERE p.creator_id = ?`
    ).bind(user.id),
  ]);
  const authenticityRow = authenticity.results[0] as
    | { total_votes: number; simulated_votes: number }
    | undefined;
  const totalVotes = authenticityRow?.total_votes ?? 0;
  const simulatedVotes = authenticityRow?.simulated_votes ?? 0;

  return json({
    pollTotals: pollTotals.results,
    votesOverTime: votesOverTime.results,
    authenticity: {
      realVotes: Math.max(0, totalVotes - simulatedVotes),
      simulatedVotes,
    },
  });
}

async function voteCountsSince(request: Request, env: Env, url: URL) {
  const user = await authenticatedUser(request, env);
  const since = optionalTimestamp(url.searchParams.get('since'));
  if (!since) throw new ApiError(400, 'A valid since timestamp is required');
  const minuteStart = new Date(since);
  minuteStart.setSeconds(0, 0);
  const { results } = await env.DB.prepare(
    `SELECT vc.poll_id, SUM(vc.real_votes + vc.simulated_votes) AS vote_count
     FROM vote_counts_minute vc
     JOIN polls p ON p.id = vc.poll_id
     WHERE p.creator_id = ? AND julianday(vc.minute_start) >= julianday(?)
     GROUP BY vc.poll_id`
  )
    .bind(user.id, minuteStart.toISOString())
    .all<{ poll_id: string; vote_count: number }>();
  return json(results);
}

async function voteMomentum(request: Request, env: Env) {
  const user = await authenticatedUser(request, env);
  const row = await env.DB.prepare(
    `SELECT
       COALESCE(SUM(CASE WHEN julianday(vc.minute_start) >= julianday('now', '-1 hour') THEN vc.real_votes + vc.simulated_votes ELSE 0 END), 0) AS current_hour,
       COALESCE(SUM(CASE WHEN julianday(vc.minute_start) >= julianday('now', '-2 hours') AND julianday(vc.minute_start) < julianday('now', '-1 hour') THEN vc.real_votes + vc.simulated_votes ELSE 0 END), 0) AS previous_hour,
       COALESCE(SUM(vc.real_votes + vc.simulated_votes), 0) AS last_seven_days
     FROM vote_counts_minute vc
     JOIN polls p ON p.id = vc.poll_id
     WHERE p.creator_id = ? AND julianday(vc.minute_start) >= julianday('now', '-7 days')`
  )
    .bind(user.id)
    .first<{ current_hour: number; previous_hour: number; last_seven_days: number }>();
  return json({
    currentHour: row?.current_hour ?? 0,
    previousHour: row?.previous_hour ?? 0,
    averageHourly: Math.round((row?.last_seven_days ?? 0) / (7 * 24)),
  });
}

async function realtimePoll(request: Request, env: Env, pollId: string) {
  if (request.headers.get('upgrade')?.toLowerCase() !== 'websocket') {
    throw new ApiError(426, 'WebSocket upgrade required');
  }
  const poll = await env.DB.prepare(
    'SELECT id, creator_id, is_public, access_key FROM polls WHERE id = ?'
  )
    .bind(pollId)
    .first<{ id: string; creator_id: string; is_public: number; access_key: string | null }>();
  if (!poll) throw new ApiError(404, 'Poll not found');
  if (poll.is_public === 0) {
    const protocols = (request.headers.get('sec-websocket-protocol') ?? '')
      .split(',')
      .map((protocol) => protocol.trim());
    const expectedKey = poll.access_key
      ? `key.${Array.from(new TextEncoder().encode(poll.access_key))
          .map((byte) => byte.toString(16).padStart(2, '0'))
          .join('')}`
      : null;
    let authorized =
      expectedKey !== null && protocols.some((protocol) => secretsMatch(protocol, expectedKey));
    const authProtocol = protocols.find((protocol) => protocol.startsWith('auth.'));
    if (!authorized && authProtocol) {
      try {
        const headers = new Headers(request.headers);
        headers.set('Authorization', `Bearer ${authProtocol.slice(5)}`);
        const user = await authenticatedUser(new Request(request, { headers }), env);
        authorized = user.id === poll.creator_id;
      } catch {
        authorized = false;
      }
    }
    if (!authorized) throw new ApiError(403, 'Poll access key or owner authentication required');
  }
  return env.POLL_ROOMS.getByName(pollId).fetch(request);
}

async function castVote(request: Request, env: Env, ctx: ExecutionContext, pollId: string) {
  const value = await requestJson(request);
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ApiError(400, 'Invalid vote payload');
  }
  const input = value as Record<string, unknown>;
  const optionId = requiredString(input.optionId, 100, 'Option ID');
  const sessionId = optionalString(input.sessionId, 200);
  const poll = await env.DB.prepare('SELECT is_public, access_key FROM polls WHERE id = ?')
    .bind(pollId)
    .first<{ is_public: number; access_key: string | null }>();
  if (!poll) throw new ApiError(404, 'Poll not found');
  if (
    poll.is_public === 0 &&
    !secretsMatch(request.headers.get('x-poll-access-key'), poll.access_key)
  ) {
    throw new ApiError(403, 'Poll access key required');
  }

  const now = new Date().toISOString();
  const ipAddress = request.headers.get('cf-connecting-ip') ?? 'unknown';
  const voteId = crypto.randomUUID();
  const statements: D1PreparedStatement[] = [
    env.DB.prepare(
      `INSERT INTO votes (id, poll_id, option_id, user_id, created_at, ip_address, is_simulated)
       VALUES (?, ?, ?, NULL, ?, ?, 0)`
    ).bind(voteId, pollId, optionId, now, ipAddress),
  ];

  if (sessionId) {
    statements.push(
      env.DB.prepare(
        `INSERT INTO user_sessions (id, user_id, poll_id, total_votes, last_vote_at, created_at)
         VALUES (?, ?, ?, 1, ?, ?)
         ON CONFLICT(user_id, poll_id) DO UPDATE SET
           total_votes = total_votes + 1,
           last_vote_at = excluded.last_vote_at`
      ).bind(crypto.randomUUID(), sessionId, pollId, now, now)
    );
  }

  await env.DB.batch(statements);
  const option = await env.DB.prepare('SELECT * FROM poll_options WHERE id = ?')
    .bind(optionId)
    .first<PollOptionRow>();
  if (option) {
    broadcastPoll(env, ctx, pollId, {
      type: 'vote',
      pollId,
      vote: {
        pollId,
        optionId,
        optionTitle: option.title,
        isSimulated: false,
      },
      option: { ...option, simulated_enabled: option.simulated_enabled === 1 },
    });
  }
  return json({ id: voteId }, 201);
}

function databaseError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('poll_not_found')) return new ApiError(404, 'Poll not found');
  if (message.includes('poll_closed')) return new ApiError(409, 'Poll is closed');
  if (message.includes('poll_expired')) return new ApiError(409, 'Poll has expired');
  if (message.includes('option_not_in_poll'))
    return new ApiError(400, 'Option does not belong to poll');
  if (message.includes('vote_limit_reached')) return new ApiError(429, 'Vote limit reached');
  return error;
}

export async function handleApi(request: Request, env: Env, ctx: ExecutionContext) {
  const url = new URL(request.url);
  const path = url.pathname;

  try {
    if (path === '/api/webhooks/dodo') return await handleDodoWebhook(request, env);
    if (request.method === 'GET' && path === '/api/health') {
      const database = await env.DB.prepare('SELECT 1 AS ok').first<{ ok: number }>();
      return json({ ok: database?.ok === 1, backend: 'cloudflare' });
    }
    if (request.method === 'GET' && path === '/api/profile') {
      const user = await authenticatedUser(request, env);
      return json(await getOrCreateProfile(env, user));
    }
    if (request.method === 'GET' && path === '/api/stats') return await platformStats(env);
    if (request.method === 'GET' && path === '/api/pro-users/count') return await proUserCount(env);
    if (request.method === 'GET' && path === '/api/analytics/summary') {
      return await analyticsSummary(request, env, url);
    }
    if (request.method === 'GET' && path === '/api/analytics/vote-counts') {
      return await voteCountsSince(request, env, url);
    }
    if (request.method === 'GET' && path === '/api/analytics/momentum') {
      return await voteMomentum(request, env);
    }
    if (request.method === 'GET' && path === '/api/leaderboard') return await leaderboard(env, url);
    if (path === '/api/polls' && request.method === 'GET') return await userPolls(request, env);
    if (path === '/api/polls' && request.method === 'POST') return await createPoll(request, env);
    if (request.method === 'GET' && path === '/api/polls/recent') return await mostRecentPoll(env);

    const slugMatch = path.match(/^\/api\/polls\/slug\/([^/]+)$/);
    if (request.method === 'GET' && slugMatch) {
      return await pollResponse(request, env, 'slug', decodeURIComponent(slugMatch[1]));
    }

    const voteMatch = path.match(/^\/api\/polls\/([^/]+)\/votes$/);
    if (request.method === 'POST' && voteMatch) {
      return await castVote(request, env, ctx, decodeURIComponent(voteMatch[1]));
    }

    const realtimeMatch = path.match(/^\/api\/realtime\/polls\/([^/]+)$/);
    if (request.method === 'GET' && realtimeMatch) {
      return await realtimePoll(request, env, decodeURIComponent(realtimeMatch[1]));
    }

    const pollMatch = path.match(/^\/api\/polls\/([^/]+)$/);
    if (request.method === 'GET' && pollMatch) {
      return await pollResponse(request, env, 'id', decodeURIComponent(pollMatch[1]));
    }
    if (request.method === 'PATCH' && pollMatch) {
      return await updatePoll(request, env, ctx, decodeURIComponent(pollMatch[1]));
    }
    if (request.method === 'DELETE' && pollMatch) {
      return await deletePoll(request, env, ctx, decodeURIComponent(pollMatch[1]));
    }

    return json({ error: 'Not found' }, 404);
  } catch (error) {
    const mapped = databaseError(error);
    if (mapped instanceof ApiError) return json({ error: mapped.message }, mapped.status);
    console.error('Worker API error', mapped);
    return json({ error: 'Internal server error' }, 500);
  }
}
