import { DurableObject } from 'cloudflare:workers';
import { hasRealtimeCapacity } from './realtime-security';

interface ConnectionState {
  role: 'viewer' | 'observer';
  clientIp: string;
}

const PRESENCE_DEBOUNCE_MS = 250;

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

type AutomaticVoteOption = Pick<
  PollOptionRow,
  'id' | 'title' | 'simulated_target_votes' | 'simulated_votes_added'
>;

export interface AutomaticVoteResult {
  applied: boolean;
  votes: number;
}

function minuteTimestamp(value: number) {
  return Math.floor(value / 60_000) * 60_000;
}

export function isAutomaticVoteDue(interval: number, scheduledTime: number) {
  const intervalMs = interval < 200 ? interval * 1_000 : interval;
  const intervalSeconds = Math.max(1, Math.ceil(intervalMs / 1_000));
  return intervalSeconds <= 60 || Math.floor(scheduledTime / 1_000) % intervalSeconds === 0;
}

async function hash(value: string) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
}

async function automaticVoteId(key: string) {
  const bytes = (await hash(key)).slice(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x80;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export class PollRoom extends DurableObject<Env> {
  private presenceTimer: ReturnType<typeof setTimeout> | null = null;

  fetch(request: Request) {
    if (request.headers.get('upgrade')?.toLowerCase() !== 'websocket') {
      return new Response('WebSocket upgrade required', { status: 426 });
    }

    const url = new URL(request.url);
    const role = url.searchParams.get('role') === 'viewer' ? 'viewer' : 'observer';
    const clientIp = request.headers.get('x-versus-client-ip') ?? 'unknown';
    const connections = this.ctx.getWebSockets();
    const clientIps = connections.map(
      (socket) => (socket.deserializeAttachment() as ConnectionState | null)?.clientIp ?? null
    );
    if (!hasRealtimeCapacity(clientIps, clientIp)) {
      return new Response('Too many realtime connections', {
        status: 429,
        headers: { 'Retry-After': '30' },
      });
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({
      role,
      clientIp,
    } satisfies ConnectionState);
    this.schedulePresenceBroadcast();
    const requestedProtocols = request.headers.get('sec-websocket-protocol');
    return new Response(null, {
      status: 101,
      webSocket: client,
      headers: requestedProtocols ? { 'Sec-WebSocket-Protocol': 'versus-space' } : undefined,
    });
  }

  broadcast(message: string) {
    this.send(message);
  }

  async runAutomaticVotes(scheduledTime: number): Promise<AutomaticVoteResult> {
    const pollId = this.ctx.id.name;
    if (!pollId || !Number.isFinite(scheduledTime)) return { applied: false, votes: 0 };

    const scheduledMinute = minuteTimestamp(scheduledTime);
    const createdAt = new Date(scheduledMinute).toISOString();
    const poll = await this.env.DB.prepare(
      `SELECT auto_vote_interval_seconds
       FROM polls
       WHERE id = ? AND is_active = 1
         AND (ends_at IS NULL OR julianday(ends_at) > julianday(?))`
    )
      .bind(pollId, createdAt)
      .first<{ auto_vote_interval_seconds: number }>();
    if (!poll || !isAutomaticVoteDue(poll.auto_vote_interval_seconds, scheduledMinute)) {
      return { applied: false, votes: 0 };
    }

    const { results: options } = await this.env.DB.prepare(
      `SELECT id, title, simulated_target_votes, simulated_votes_added
       FROM poll_options
       WHERE poll_id = ? AND simulated_enabled = 1
         AND COALESCE(simulated_target_votes, 0) > simulated_votes_added
       ORDER BY id`
    )
      .bind(pollId)
      .all<AutomaticVoteOption>();
    if (options.length === 0) return { applied: false, votes: 0 };

    const plannedVotes = (
      await Promise.all(
        options.map(async (option) => {
          const key = `${pollId}:${createdAt}:${option.id}`;
          const random = await hash(key);
          const remaining = (option.simulated_target_votes ?? 0) - option.simulated_votes_added;
          const delta = Math.min((random[0] % 3) + 1, remaining);
          return Promise.all(
            Array.from({ length: delta }, async (_, index) => ({
              id: await automaticVoteId(`${key}:${index}`),
              option,
            }))
          );
        })
      )
    ).flat();

    const batch = plannedVotes.map(({ id, option }) =>
      this.env.DB.prepare(
        `INSERT OR IGNORE INTO votes
         (id, poll_id, option_id, user_id, created_at, ip_address, is_simulated)
         VALUES (?, ?, ?, NULL, ?, 'auto_simulator', 1)`
      ).bind(id, pollId, option.id, createdAt)
    );
    const writes = await this.env.DB.batch(batch);
    const insertedByOption = new Map<string, number>();
    writes.forEach((result, index) => {
      if (result.meta.changes === 0) return;
      const optionId = plannedVotes[index].option.id;
      insertedByOption.set(optionId, (insertedByOption.get(optionId) ?? 0) + 1);
    });
    const insertedVotes = Array.from(insertedByOption.values()).reduce(
      (total, count) => total + count,
      0
    );
    if (insertedVotes === 0) return { applied: false, votes: 0 };

    const insertedOptionIds = Array.from(insertedByOption.keys());
    const placeholders = insertedOptionIds.map(() => '?').join(', ');
    const { results: updatedOptions } = await this.env.DB.prepare(
      `SELECT * FROM poll_options WHERE id IN (${placeholders}) ORDER BY id`
    )
      .bind(...insertedOptionIds)
      .all<PollOptionRow>();
    for (const option of updatedOptions) {
      const count = insertedByOption.get(option.id) ?? 0;
      const message = JSON.stringify({
        type: 'vote',
        pollId,
        vote: {
          pollId,
          optionId: option.id,
          optionTitle: option.title,
          isSimulated: true,
        },
        option: { ...option, simulated_enabled: option.simulated_enabled === 1 },
      });
      for (let index = 0; index < count; index += 1) this.send(message);
    }

    return { applied: true, votes: insertedVotes };
  }

  webSocketClose() {
    this.schedulePresenceBroadcast();
  }

  webSocketError() {
    this.schedulePresenceBroadcast();
  }

  private schedulePresenceBroadcast() {
    if (this.presenceTimer !== null) return;
    this.presenceTimer = setTimeout(() => {
      this.presenceTimer = null;
      this.broadcastPresence();
    }, PRESENCE_DEBOUNCE_MS);
  }

  private broadcastPresence() {
    const viewerCount = this.ctx
      .getWebSockets()
      .map((socket) => socket.deserializeAttachment() as ConnectionState | null)
      .filter((state) => state?.role === 'viewer').length;
    this.send(JSON.stringify({ type: 'presence', pollId: this.ctx.id.name ?? '', viewerCount }));
  }

  private send(message: string) {
    for (const socket of this.ctx.getWebSockets()) {
      try {
        socket.send(message);
      } catch (error) {
        console.warn('Failed to send poll realtime event', error);
      }
    }
  }
}
