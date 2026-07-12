# Current Supabase Usage

Supabase is retained for authentication and as the frozen rollback source. Production application data, realtime updates, scheduled voting, and payment webhooks now run on Cloudflare Workers, D1, Durable Objects, and Cron Triggers.

## Active production usage

Supabase Auth still handles:

- Email and password signup and sign-in
- Sign-out
- Session persistence and token refresh
- Restoring the current user when the app starts
- Notifying the application when authentication state changes

The Worker validates Supabase access tokens and continues using the existing Supabase user UUID as the application identity. This avoids password resets or identity remapping.

Relevant code:

- `src/core/infrastructure/supabase/authSupabaseGateway.ts`
- `src/core/infrastructure/cloudflare/userProfileCloudflareGateway.ts`
- `worker/api.ts`

## Frozen rollback surface

The following Supabase application-data objects are retained but are no longer the active production data path:

### Tables

- `polls`
- `poll_options`
- `votes`
- `user_sessions`
- `user_profiles`

### View

- `public_poll_leaderboard`

### RPCs

- `cast_vote_with_limits`
- `increment_user_session_votes`
- `get_votes_over_time`
- `get_vote_counts_by_date`
- `perform_auto_votes`

Writes to the migrated tables remain blocked by the cutover freeze triggers. The obsolete Supabase data gateways have been removed; a rollback must be implemented from the frozen database only after replaying and reconciling post-cutover D1 writes.

Rollback-related code:

- `supabase/cutover/enable_write_freeze.sql`
- `supabase/cutover/disable_write_freeze.sql`

## Cloudflare replacements

- D1 stores profiles, polls, options, sessions, current votes, and analytics aggregates.
- Durable Objects coordinate poll realtime broadcasts.
- Worker Cron runs automatic simulated voting once per minute.
- `POST /api/webhooks/dodo` verifies and processes Dodo payment webhooks.
- The frontend always uses the Cloudflare data gateways.

The Dodo signing key and Supabase anonymous key are Worker secrets. They must never be placed in `VITE_*` variables or committed files.

## Runtime configuration

The browser still requires:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

These values support authentication. Application-data requests use the same-origin `/api` Worker routes.

## Supabase features not used

- Supabase Storage
- File uploads
- Frontend Edge Function invocation

The checked-in `supabase/config.toml` and schema-only baseline contain no production rows or credentials. The original remote migration history is not reconstructed; the frozen hosted database remains the rollback source of truth until retirement.
