import { handleApi } from './api';
import { isAutomaticVoteDue } from './poll-room';
export { PollRoom } from './poll-room';

interface ScheduledPoll {
  id: string;
  auto_vote_interval_seconds: number;
}

const maintenanceHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="robots" content="noindex">
    <title>Versus.Space maintenance</title>
    <style>
      :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
      body { min-height: 100vh; margin: 0; display: grid; place-items: center; background: #09090b; color: #fafafa; }
      main { width: min(34rem, calc(100% - 3rem)); }
      p { color: #a1a1aa; line-height: 1.6; }
      small { color: #71717a; }
    </style>
  </head>
  <body>
    <main>
      <h1>We'll be right back.</h1>
      <p>Versus.Space is temporarily unavailable for maintenance. Please try again in a few minutes.</p>
      <small>No votes or polls are being deleted.</small>
    </main>
  </body>
</html>`;

function maintenanceResponse(request: Request) {
  const headers = {
    'Cache-Control': 'no-store',
    'Retry-After': '300',
    'X-Robots-Tag': 'noindex',
  };
  if (new URL(request.url).pathname.startsWith('/api/')) {
    return Response.json(
      { error: 'Versus.Space is temporarily unavailable for maintenance' },
      { status: 503, headers }
    );
  }
  return new Response(request.method === 'HEAD' ? null : maintenanceHtml, {
    status: 503,
    headers: {
      ...headers,
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    if (String(env.MAINTENANCE_MODE) === 'true') return maintenanceResponse(request);
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      return handleApi(request, env, ctx);
    }

    return env.ASSETS.fetch(request);
  },
  async scheduled(controller, env) {
    const scheduledTime = Math.floor(controller.scheduledTime / 60_000) * 60_000;
    const scheduledAt = new Date(scheduledTime).toISOString();
    const { results } = await env.DB.prepare(
      `SELECT DISTINCT p.id, p.auto_vote_interval_seconds
       FROM polls p
       JOIN poll_options po ON po.poll_id = p.id
       WHERE p.is_active = 1
         AND (p.ends_at IS NULL OR julianday(p.ends_at) > julianday(?))
         AND po.simulated_enabled = 1
         AND COALESCE(po.simulated_target_votes, 0) > po.simulated_votes_added
       ORDER BY p.id`
    )
      .bind(scheduledAt)
      .all<ScheduledPoll>();

    let votes = 0;
    const failures: Array<{ pollId: string; error: string }> = [];
    for (const poll of results.filter((candidate) =>
      isAutomaticVoteDue(candidate.auto_vote_interval_seconds, scheduledTime)
    )) {
      try {
        votes += (await env.POLL_ROOMS.getByName(poll.id).runAutomaticVotes(scheduledTime)).votes;
      } catch (error) {
        failures.push({
          pollId: poll.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    console.log(
      JSON.stringify({
        message: 'automatic voting schedule completed',
        scheduledAt,
        eligiblePolls: results.length,
        votes,
        failures,
      })
    );
    if (failures.length > 0) throw new Error('One or more automatic-voting polls failed');
  },
} satisfies ExportedHandler<Env>;
