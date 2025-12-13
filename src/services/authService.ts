import { supabase } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

/**
 * Handles authentication flows and keeps Supabase-specific logic out of UI layers.
 */
export class AuthService {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        scopes: 'email profile',
      },
    });

    if (error) throw error;
    return data;
  }

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  }

  // Subscribe to auth events and return a cleanup handler for consumers.
  onAuthStateChange(callback: (user: User | null) => void) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        callback(session?.user ?? null);
      })();
    });

    return () => subscription.unsubscribe();
  }
}

export const authService = new AuthService();
