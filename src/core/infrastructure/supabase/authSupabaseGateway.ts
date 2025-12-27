import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../../types/database';
import type { AuthGateway } from '../../domain/auth';

/**
 * Supabase-backed implementation of the AuthGateway contract.
 */
export function createSupabaseAuthGateway(client: SupabaseClient<Database>): AuthGateway {
  return {
    async signUp(email, password) {
      const { error } = await client.auth.signUp({ email, password });
      if (error) throw error;
    },

    async signIn(email, password) {
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },

    async signOut() {
      const { error } = await client.auth.signOut();
      if (error) throw error;
    },

    async signInWithGoogle() {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          scopes: 'email profile',
        },
      });

      if (error) throw error;
    },

    async getCurrentUser() {
      const {
        data: { user },
        error,
      } = await client.auth.getUser();

      if (error) throw error;
      return user ?? null;
    },

    onAuthStateChange(callback) {
      const {
        data: { subscription },
      } = client.auth.onAuthStateChange((_event, session) => {
        callback(session?.user ?? null);
      });

      return () => subscription.unsubscribe();
    },
  };
}
