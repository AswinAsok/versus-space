import { authClient } from '../lib/authClient';

/**
 * Subscribes to Better Auth's cookie-backed session and surfaces the current user.
 * Encapsulates auth side-effects so components remain focused on rendering.
 */
export function useAuth() {
  const { data, isPending } = authClient.useSession();
  return { user: data?.user ?? null, loading: isPending };
}
