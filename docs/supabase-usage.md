# Current Supabase Usage

Supabase has no active production runtime responsibility. It is retained temporarily as the frozen authentication and application-data rollback source while production runs on Cloudflare Workers, Better Auth, D1, Durable Objects, Cron Triggers, and Resend.

The completed auth cutover is documented in the [Better Auth + Cloudflare migration plan](better-auth-cloudflare-migration-plan.md).

## Migrated authentication

Supabase Auth responsibilities migrated on 2026-07-12:

- ~~Email and password signup and sign-in~~
- ~~Sign-out~~
- ~~Session persistence and token refresh~~
- ~~Restoring the current user when the app starts~~
- ~~Notifying the application when authentication state changes~~

Better Auth now handles these flows in the Worker with D1-backed sessions and credentials. The migration preserved each Supabase user UUID, imported 31 compatible password hashes, classified 9 legacy/non-password accounts for password setup, and reconciled all 40 users without ownership failures. Relevant replacement code:

- `src/core/infrastructure/cloudflare/authCloudflareGateway.ts`
- `src/core/infrastructure/cloudflare/userProfileCloudflareGateway.ts`
- `worker/auth.ts`
- `worker/email.ts`
- `worker/api.ts`
- `migrations/0008_better_auth.sql`

## Frozen rollback surface

The following Supabase application-data objects are retained but are no longer the active production data path. Struck-through objects have been migrated to Cloudflare:

### Tables

- ~~`polls`~~
- ~~`poll_options`~~
- ~~`votes`~~
- ~~`user_sessions`~~
- ~~`user_profiles`~~

### View

- ~~`public_poll_leaderboard`~~

### RPCs

- ~~`cast_vote_with_limits`~~
- ~~`increment_user_session_votes`~~
- ~~`get_votes_over_time`~~
- ~~`get_vote_counts_by_date`~~
- ~~`perform_auto_votes`~~

Writes to the migrated tables remain blocked by the cutover freeze triggers. The obsolete Supabase data gateways have been removed; a rollback must be implemented from the frozen database only after replaying and reconciling post-cutover D1 writes.

Rollback-related code:

- `supabase/cutover/enable_write_freeze.sql`
- `supabase/cutover/disable_write_freeze.sql`

## Cloudflare replacements

- D1 stores Better Auth users, credentials, sessions, verification records, durable rate limits, profiles, polls, options, current votes, and analytics aggregates.
- Durable Objects coordinate poll realtime broadcasts.
- Worker Cron runs automatic simulated voting once per minute.
- `POST /api/webhooks/dodo` verifies and processes Dodo payment webhooks.
- The frontend always uses the Cloudflare data gateways.

The Dodo signing key and Better Auth secret are Worker secrets. They must never be placed in `VITE_*` variables or committed files.

## Runtime configuration

The browser no longer requires Supabase environment variables. Authentication uses same-origin `/api/auth/*` routes with secure HTTP-only cookies.

The Worker requires:

- `BETTER_AUTH_URL`
- `BETTER_AUTH_SECRET` (secret)
- `AUTH_EMAIL_FROM`
- `RESEND_API_KEY` (secret)

## Supabase features not used

- Supabase Storage
- File uploads
- Frontend Edge Function invocation

The checked-in `supabase/config.toml` and schema-only baseline contain no production rows or credentials. The original remote migration history is not reconstructed; the frozen hosted database remains the rollback source of truth until retirement.
