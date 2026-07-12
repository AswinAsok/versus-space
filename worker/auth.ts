import { compare, hash } from 'bcryptjs';
import { betterAuth } from 'better-auth';
import { sendAuthEmail } from './email';

export function createAuth(env: Env, ctx?: ExecutionContext) {
  const background = (promise: Promise<unknown>) => {
    const tracked = promise.catch((error: unknown) => {
      const details =
        error && typeof error === 'object'
          ? {
              name: 'name' in error ? String(error.name) : 'Error',
              code: 'code' in error ? String(error.code) : undefined,
              message: 'message' in error ? String(error.message) : 'Unknown email delivery error',
            }
          : { name: 'Error', message: String(error) };
      console.error(JSON.stringify({ event: 'auth_email_delivery_failed', ...details }));
      throw error;
    });
    if (ctx) {
      ctx.waitUntil(tracked);
      return Promise.resolve();
    }
    return tracked.then(() => undefined);
  };

  return betterAuth({
    database: env.DB,
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    basePath: '/api/auth',
    trustedOrigins: [env.BETTER_AUTH_URL],
    advanced: {
      cookiePrefix: 'versus-space',
      database: { generateId: 'uuid' },
      ipAddress: { ipAddressHeaders: ['cf-connecting-ip'] },
    },
    user: { modelName: 'auth_users' },
    session: { modelName: 'auth_sessions' },
    account: { modelName: 'auth_accounts' },
    verification: { modelName: 'auth_verifications' },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      sendVerificationEmail: ({ user, url }) =>
        background(
          sendAuthEmail(env, user.email, 'Verify your Versus.Space email', 'Verify your email', url)
        ),
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 8,
      revokeSessionsOnPasswordReset: true,
      password: {
        hash: (password) => hash(password, 10),
        verify: ({ password, hash: passwordHash }) => compare(password, passwordHash),
      },
      sendResetPassword: ({ user, url }) =>
        background(
          sendAuthEmail(
            env,
            user.email,
            'Reset your Versus.Space password',
            'Reset your password',
            url
          )
        ),
    },
    rateLimit: {
      enabled: true,
      storage: 'database',
      modelName: 'auth_rate_limits',
    },
  });
}

export async function authUser(request: Request, env: Env) {
  const session = await createAuth(env).api.getSession({ headers: request.headers });
  return session?.user ?? null;
}
