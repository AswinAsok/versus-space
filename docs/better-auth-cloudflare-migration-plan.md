# Better Auth + Cloudflare Migration Plan

Status: deployed to production on 2026-07-12; final imported-user sign-in smoke test and observation window remain

Target: replace the remaining Supabase Auth dependency with Better Auth running in the existing Cloudflare Worker and storing auth data in D1.

## Outcome

After this migration:

- Better Auth handles email/password signup, sign-in, sign-out, sessions, email verification, and password resets.
- The existing Worker serves Better Auth under `/api/auth/*`.
- D1 stores Better Auth users, credentials, sessions, and verification tokens.
- Resend sends verification and password-reset messages from the Cloudflare Worker.
- Existing Supabase user UUIDs remain the application user IDs.
- Existing profiles, polls, votes, sessions, roles, plans, and webhook mappings keep their current ownership.
- Supabase is retained temporarily as a frozen auth rollback source, then removed after the rollback window.

The cutover may invalidate existing browser sessions. Requiring one fresh sign-in is acceptable; changing account ownership or silently losing an account is not.

## Migration invariants

These are hard gates, not best-effort goals:

1. A migrated user's Better Auth ID must equal their current Supabase `auth.users.id`.
2. Every D1 `user_profiles.user_id` and `polls.creator_id` that refers to a registered user must resolve to the same Better Auth user after import.
3. Verified-email state must come from Supabase, not be guessed from the presence of an email address.
4. Passwords must never be exported or logged in plaintext. Only Supabase's existing bcrypt hashes may be moved.
5. Supabase refresh tokens and sessions will not be imported. Better Auth creates new sessions after users sign in.
6. Production signup remains unavailable during the final export/import window so no account is created in only one system.
7. No secret, auth export, password hash, session token, or production email address list may enter Git.

## Current auth surface

| Current responsibility         | Current implementation                                        | Better Auth replacement                                       |
| ------------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------- |
| Browser client                 | `src/lib/supabaseClient.ts`                                   | `src/lib/authClient.ts` using `createAuthClient`              |
| Signup/sign-in/sign-out        | `src/core/infrastructure/supabase/authSupabaseGateway.ts`     | `src/core/infrastructure/cloudflare/authCloudflareGateway.ts` |
| Session restoration            | `src/hooks/useAuth.ts` and Supabase auth events               | Better Auth session query/subscription                        |
| UI user type                   | `User` from `@supabase/supabase-js` in application components | Repo-owned `AppUser` type derived from the Better Auth client |
| API authentication             | Supabase access token in `Authorization: Bearer ...`          | Same-origin, signed, HTTP-only Better Auth session cookie     |
| WebSocket owner authentication | Supabase token in `Sec-WebSocket-Protocol`                    | Same-origin Better Auth cookie on the WebSocket upgrade       |
| Worker verification            | Remote request to `${SUPABASE_URL}/auth/v1/user`              | Local `auth.api.getSession({ headers })` lookup against D1    |
| User identity                  | Supabase UUID                                                 | The same UUID imported into Better Auth                       |
| Verification/reset email       | Supabase Auth email delivery                                  | Resend HTTPS API from the Cloudflare Worker                   |

Application data is already in D1. The authoritative registered-user joins are `user_profiles.user_id` and `polls.creator_id`. The `votes.user_id` and `user_sessions.user_id` columns can also contain anonymous/session identifiers, so they must be preserved but must not all be treated as auth users. None of these application tables should be rewritten during the auth migration.

## Target architecture

```text
React SPA
  |-- /api/auth/* ------> Better Auth in Worker ----> D1 auth_* tables
  |                              |
  |                              +---------------> Resend
  |
  |-- /api/* + session cookie --> Worker API -----> existing D1 app tables
  |
  `-- WebSocket + cookie -------> Worker/DO ------> poll room
```

Production should use one canonical origin, `https://versus.space`. Redirect `www.versus.space` to the canonical origin before cutover instead of sharing auth cookies across subdomains.

## Better Auth design decisions

### Database

Use the existing D1 `DB` binding. Configure explicit model names so auth data is unambiguous and does not collide with the application's existing `user_sessions` table:

- `auth_users`
- `auth_sessions`
- `auth_accounts`
- `auth_verifications`
- `auth_rate_limits`

Generate the schema from the pinned Better Auth version and commit the reviewed SQL as `migrations/0008_better_auth.sql`. Do not hand-copy a schema from documentation, and do not run runtime auto-migrations in production.

Store Better Auth rate-limit state in D1 through `auth_rate_limits`; per-isolate memory is not a durable rate-limit store on Workers.

### Sessions

Use Better Auth's database-backed cookie sessions:

- HTTP-only and secure in production.
- Same-origin requests only.
- `SameSite=Lax` unless staging proves a stricter value works for every callback.
- A distinct cookie prefix such as `versus-space`.
- Server-side session lookup for every protected API operation.
- Revoke other sessions after a password reset.

Do not preserve the current bearer-token or WebSocket subprotocol mechanism. Browser cookies are already sent on same-origin HTTP requests and WebSocket upgrades, so copying a session token into JavaScript would weaken the new design.

### Passwords

Supabase stores password hashes using bcrypt, while Better Auth's default password algorithm differs. The migration must first prove that a Workers-compatible bcrypt verifier can validate an exported Supabase hash inside the deployed Worker runtime.

Preferred path:

1. Import the existing bcrypt hash into the Better Auth credential account.
2. Configure Better Auth's custom `hash` and `verify` callbacks to use the reviewed Workers-compatible bcrypt implementation.
3. Keep bcrypt for new passwords during the initial migration; algorithm rotation is a later, independent change.

Fallback if the compatibility or Worker CPU test fails:

1. Import the user ID, email, timestamps, and verification state without a credential hash.
2. Send each user a Better Auth password-setup link through Resend.
3. Do not create a new user ID during password setup.

The fallback preserves accounts and ownership but requires users to set a new password. The implementation must not attempt to decrypt, transform, or log password hashes.

### Email

Use Resend's HTTPS API from the Worker with a sender such as `auth@versus.space`.

- Verify `versus.space` in Resend and publish its SPF/DKIM records before staging tests.
- Send both HTML and plain-text bodies.
- Use Better Auth's generated, expiring verification/reset URLs.
- Dispatch email with `ctx.waitUntil(...)` so auth responses do not expose delivery timing.
- Require email verification for new accounts.
- Import existing verification state from `auth.users.email_confirmed_at`.
- Return generic responses for duplicate signup and password-reset requests to reduce email enumeration.

### Secrets and configuration

Add:

- `BETTER_AUTH_SECRET` as a Worker secret in staging and production.
- `BETTER_AUTH_URL=https://versus.space` as non-secret production configuration.
- `RESEND_API_KEY` as a Worker secret in staging and production.

Remove only after the rollback window:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- Worker `SUPABASE_URL`
- Worker `SUPABASE_ANON_KEY`
- `@supabase/supabase-js`

The Better Auth secret must be generated independently for staging and production and must not be committed.

## Supabase-to-Better-Auth mapping

Before writing the importer, inventory `auth.users` and `auth.identities` by provider. The current UI supports email/password, but the hosted database may still contain older OAuth identities.

| Supabase source             | Better Auth destination             | Rule                                                                  |
| --------------------------- | ----------------------------------- | --------------------------------------------------------------------- |
| `auth.users.id`             | `auth_users.id`                     | Preserve exactly                                                      |
| `auth.users.email`          | `auth_users.email`                  | Normalize for comparison, preserve the address                        |
| User metadata name          | `auth_users.name`                   | Use the existing name; fall back to email until profile naming exists |
| `email_confirmed_at`        | `auth_users.emailVerified`          | `true` only when confirmed                                            |
| `created_at` / `updated_at` | Better Auth timestamps              | Preserve                                                              |
| `encrypted_password`        | `auth_accounts.password`            | Copy the bcrypt hash only after the compatibility gate passes         |
| Supabase user UUID          | Credential `accountId` and `userId` | Preserve exactly; provider is `credential`                            |

Provider inventory is a cutover gate:

- Email/password users with bcrypt hashes follow the preferred password path.
- Users without a password hash must receive the password-setup flow.
- Any legacy Google or other OAuth identity must either get an equivalent Better Auth provider or be deliberately converted to verified-email password setup.
- Anonymous, phone-only, deleted, banned, or duplicate-email records require an explicit disposition; the importer must stop instead of silently skipping them.

## Proposed repository changes

New files:

- `worker/auth.ts` — Better Auth factory/configuration using `env.DB`.
- `worker/email.ts` — verification and reset email delivery through Resend's HTTPS API.
- `src/lib/authClient.ts` — browser Better Auth client.
- `src/core/infrastructure/cloudflare/authCloudflareGateway.ts` — keeps the existing facade boundary while changing providers.
- `src/types/auth.ts` — application-owned user/session types.
- `migrations/0008_better_auth.sql` — generated and reviewed Better Auth tables/indexes.
- `scripts/transform-supabase-auth.mjs` — deterministic offline export transformer.
- `scripts/reconcile-auth-migration.mjs` — count, identity, ownership, and credential checks.

Existing files to change:

- `worker/index.ts` — mount `/api/auth/*` before the application API router.
- `worker/api.ts` — replace remote Supabase verification with Better Auth session lookup; authenticate private WebSockets from cookies.
- `wrangler.jsonc` — add the email binding and Better Auth configuration/secrets; later remove Supabase configuration.
- `worker/.env.example` — add non-production Better Auth placeholders without real secrets.
- `src/lib/apiClient.ts` — stop reading Supabase sessions and attaching bearer tokens.
- `src/core/appServices.ts` — export the Cloudflare auth gateway.
- `src/hooks/useAuth.ts` — source loading/user state from Better Auth.
- `src/core/infrastructure/cloudflare/realtimeCloudflareGateway.ts` — stop placing auth tokens in WebSocket protocols.
- `src/components/Auth/AuthForm.tsx` — use Better Auth errors and verification flow; add forgot/reset password entry points.
- Components importing Supabase `User` — switch to the repo-owned `AppUser` type.
- `package.json` and `package-lock.json` — add pinned Better Auth/auth-hash dependencies, then remove Supabase.
- `README.md` and `docs/supabase-usage.md` — document the final Cloudflare-only runtime after retirement.

## Phase 0 — prerequisites and compatibility spike

Tasks:

1. Pin an exact stable Better Auth version in `package-lock.json`.
2. Confirm that the installed version accepts the D1 binding directly and generate its schema.
3. Test one non-production Supabase bcrypt hash against a Workers-compatible verifier under `wrangler dev` and a deployed staging Worker.
4. Measure the sign-in request against Worker CPU limits and verify malformed hashes fail safely.
5. Confirm the provider inventory from `auth.identities`.
6. Verify `versus.space` in Resend and configure SPF/DKIM.
7. Decide how users without credential hashes will set a password.
8. Confirm the apex-domain redirect strategy.

Commands to validate during implementation:

```bash
npx wrangler email sending list versus.space
npx wrangler email sending enable versus.space
npx wrangler email sending dns get versus.space
npx auth@<pinned-version> generate --config worker/auth.ts --output migrations/0008_better_auth.sql --yes
```

Exit gate:

- A staging Worker can create a Better Auth session from an imported test user's existing password, or the team explicitly selects the password-setup fallback.
- Verification and reset emails arrive with valid links.
- Generated SQL is committed and reviewed.

## Phase 1 — add the Better Auth server path

Tasks:

1. Add the generated auth tables through D1 migration `0008`.
2. Create a request-scoped Better Auth instance using `env.DB`, `BETTER_AUTH_SECRET`, the canonical base URL, and trusted origins.
3. Mount the handler at `/api/auth/*` before `handleApi`.
4. Configure email/password auth, verification, reset, session expiry, session revocation, and built-in auth rate limiting.
5. Implement Resend delivery using `ctx.waitUntil`.
6. Change `authenticatedUser` to obtain `{ id, email }` from the Better Auth session.
7. Preserve `getOrCreateProfile`; it should receive the same UUID and therefore reuse the existing D1 profile.
8. Authenticate private-poll WebSocket upgrades from their cookie header.
9. Keep the old Supabase implementation available in the previous Cloudflare deployment; do not add auth dual-writes.

Exit gate:

- All protected Worker routes return `401` without a valid Better Auth session and succeed with one.
- Tampered, revoked, and expired cookies fail.
- The session's user ID resolves to the correct existing profile, role, plan, and owned polls.

## Phase 2 — migrate the frontend

Tasks:

1. Add `authClient` for same-origin `/api/auth` calls.
2. Keep the current `authFacade` API where it reduces component churn, but implement it with Better Auth.
3. Replace `useAuth`'s Supabase event subscription with Better Auth session state.
4. Introduce `AppUser` and replace all UI imports of Supabase's `User` type.
5. Remove bearer-token attachment from `apiClient`; use same-origin cookies.
6. Remove the auth token from WebSocket subprotocols. Keep the existing poll access-key protocol unchanged.
7. Wire the existing verification modal to the Better Auth verification result.
8. Add request-reset and set-new-password screens and success/error states.
9. Preserve existing redirect and loading behavior through page refreshes.

Exit gate:

- Signup, verification, sign-in, refresh, sign-out, reset, and private-poll ownership work in staging.
- No browser JavaScript can read the session token.
- No application component imports a Supabase user type.

## Phase 3 — build deterministic migration tooling

The export and transform happen outside the repository. Only generic scripts and sanitized fixtures may be committed. A full encrypted `auth` schema dump may be kept as the rollback backup, but the transformer should consume a restricted extract containing only the required `auth.users` and `auth.identities` columns so refresh tokens and sessions never enter the transformation pipeline.

Encrypted rollback-backup command:

```bash
supabase db dump --linked --schema auth --data-only --file /secure/path/supabase-auth-rollback.sql
```

Create the restricted migration extract with a reviewed SQL query over the linked database connection. Include only user ID, email, bcrypt hash, confirmation timestamp, creation/update timestamps, required user metadata, account status, and identity provider records. Store both artifacts encrypted outside the repo and delete the restricted extract after the rollback window.

The transformer must:

1. Read a structured, restricted extract of the required `auth.users` and `auth.identities` fields.
2. Refuse duplicate normalized emails or duplicate IDs.
3. Preserve user UUIDs and timestamps.
4. Map email confirmation exactly.
5. Create one credential account for each supported bcrypt user.
6. Produce parameterized/import-safe D1 SQL without emitting hashes to logs.
7. Print counts and a checksum, not user data.
8. Be idempotent or fail cleanly when a target record already exists.

The reconciliation script must prove:

- Source users = imported Better Auth users + explicitly classified exceptions.
- Credential source users = Better Auth credential accounts, unless assigned to the password-setup fallback.
- No duplicate Better Auth user ID or normalized email exists.
- Every D1 profile user ID exists in Better Auth.
- Every registered poll creator exists in Better Auth.
- Imported verification state matches Supabase.
- Existing role, plan, poll ownership, vote ownership, and Dodo user mappings are unchanged.
- No Supabase session or refresh token was imported.

Exit gate:

- A full staging export/import/reconciliation completes twice from a clean staging database with identical results.

## Phase 4 — staging rehearsal

Run the exact production sequence against the staging Worker and staging D1 database:

```bash
npx wrangler d1 migrations apply DB --remote --env staging
npm run cf:deploy:staging
npm run lint
npm run typecheck
npm run typecheck:worker
npm run build
npm run format:check
```

Test matrix:

- New verified signup and generic duplicate-signup response.
- Existing verified user login with the old password.
- Existing unverified user blocked and able to resend verification.
- Password reset, token expiry, token reuse rejection, and other-session revocation.
- Sign-out and page-refresh session behavior.
- Correct profile, role, plan, owned polls, analytics, and upgrade state.
- Private-poll owner access over WebSocket.
- Public poll browsing and voting while signed out.
- Invalid/tampered cookie rejection.
- Untrusted `Origin` rejection on auth mutations.
- Auth endpoint rate limiting.
- Verification/reset email delivery, SPF, DKIM, links, and callback origin.

Exit gate:

- All checks pass and the rehearsal runbook records exact durations, counts, and rollback steps.

## Phase 5 — production cutover

### Before maintenance

1. Confirm the previous Cloudflare deployment version is available for rollback.
2. Run all repository checks from Phase 4.
3. Confirm Resend delivery health and production `BETTER_AUTH_SECRET`.
4. Record the current D1 Time Travel bookmark and take an encrypted D1 export outside the repo:

```bash
npx wrangler d1 time-travel info versus-space-compact-production
npx wrangler d1 export versus-space-compact-production --remote --output=/secure/path/versus-space-pre-auth-cutover.sql
```

5. Take an encrypted preliminary Supabase auth export and reconcile its counts.

### Maintenance window

1. Enable the existing maintenance response to block signup, login, password changes, and application writes.
2. Take the final Supabase auth export.
3. Record the export checksum and provider/user counts.
4. Apply `0008_better_auth.sql` to production D1.
5. Transform and import the final auth snapshot.
6. Run reconciliation. Stop immediately on any unclassified or orphaned record.
7. Deploy the Better Auth Worker/frontend version.
8. Smoke-test with:
   - one imported regular user;
   - one imported superadmin;
   - one new verified signup;
   - one password reset;
   - one private-poll WebSocket owner connection;
   - one signed-out public vote.
9. Disable maintenance only after every smoke test passes.

### Immediate observation

Monitor for at least the first hour:

- `/api/auth/*` error and latency rate.
- `401` rate on protected application endpoints.
- D1 auth table growth and session creation.
- Email delivery failures and suppressions.
- Profile or poll-owner mismatches.
- WebSocket authorization failures.

Exit gate:

- Production sessions are created only by Better Auth, existing users retain ownership, and no runtime request reaches Supabase Auth.

## Rollback plan

### Before production traffic reaches Better Auth

1. Keep maintenance enabled.
2. Roll back the Worker/assets to the previous Cloudflare deployment.
3. Leave the additive D1 auth tables in place; the old release does not use them.
4. Disable maintenance and confirm Supabase login still works.

### After Better Auth traffic begins

If only sessions were created, roll back the deployment as above. Users will return to their prior Supabase sessions or sign in again.

If new users, password resets, email changes, or password changes occurred in Better Auth, do not blindly switch back to Supabase. First export and reconcile the auth delta. New Better Auth-only users need an account created in Supabase and a verified password-reset flow before provider rollback.

Do not restore the whole D1 database merely to remove Better Auth records: the same database contains live polls and votes, so a whole-database restore could discard valid application writes. D1 Time Travel is an emergency protection for the maintenance-window schema/import operation, not the normal auth rollback mechanism.

## Phase 6 — stabilization and Supabase retirement

Keep the Supabase project and final encrypted auth export available for a defined rollback window, recommended at least 14 days.

During the window:

- Reconcile Better Auth users against profiles daily.
- Review auth failures, reset requests, and email delivery.
- Keep the previous Cloudflare deployment and Supabase credentials available only to operators.
- Do not add new Supabase auth usage.

After the window and a final reconciliation:

1. Delete `src/lib/supabaseClient.ts` and `src/core/infrastructure/supabase/authSupabaseGateway.ts`.
2. Remove `@supabase/supabase-js` and all Supabase `User` imports.
3. Remove `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, and `SUPABASE_ANON_KEY` from code, config, CI, and Cloudflare secrets.
4. Regenerate `worker-configuration.d.ts`.
5. Update `docs/supabase-usage.md` to strike through Supabase Auth and state that Supabase is no longer in the runtime path.
6. Store the final encrypted Supabase auth export according to the backup-retention policy.
7. Retire or delete the Supabase project only as a separately approved, irreversible operation.

## Final acceptance checklist

- [ ] All source Supabase users are imported or explicitly classified.
- [ ] Existing user UUIDs are unchanged.
- [ ] Existing passwords work, or every affected user has a tested password-setup path.
- [ ] Existing verified/unverified state is preserved.
- [ ] Existing profiles, roles, plans, polls, votes, and billing mappings are unchanged.
- [ ] Signup, verification, sign-in, sign-out, refresh, and reset work on production.
- [ ] Private-poll WebSocket authorization works without exposing a session token to JavaScript.
- [ ] Auth cookies are secure, HTTP-only, same-origin, and rejected when tampered or expired.
- [ ] Auth mutation endpoints are rate-limited and reject untrusted origins.
- [ ] Verification and reset email delivery is monitored.
- [ ] No production auth request reaches Supabase.
- [ ] Supabase secrets and package dependencies are removed only after the rollback window.
- [ ] Backups, checksums, reconciliation output, and rollback instructions are recorded outside the repository without user data.

## Deliberately deferred

The initial migration should not add social login, passkeys, MFA, organizations, a separate auth database, KV session caching, or custom OAuth-provider behavior. Add them only after the email/password migration is stable and there is a concrete product requirement.

## Primary references

- [Better Auth database and schema](https://better-auth.com/docs/concepts/database)
- [Better Auth CLI schema generation](https://better-auth.com/docs/concepts/cli)
- [Better Auth email/password authentication](https://better-auth.com/docs/authentication/email-password)
- [Better Auth email verification and password reset](https://better-auth.com/docs/concepts/email)
- [Better Auth cookie behavior](https://better-auth.com/docs/concepts/cookies)
- [Supabase password storage](https://supabase.com/docs/guides/auth/password-security)
- [Supabase auth-user migration](https://supabase.com/docs/guides/troubleshooting/migrating-auth-users-between-projects)
- [Resend send-email API](https://resend.com/docs/api-reference/emails/send-email)
- [Cloudflare Worker secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Cloudflare D1 import/export](https://developers.cloudflare.com/d1/best-practices/import-export-data/)
- [Cloudflare D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/)
