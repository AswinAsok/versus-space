import type { User } from '@supabase/supabase-js';

/**
 * Abstraction over authentication mechanics so UI and use-cases depend on contracts, not Supabase.
 */
export interface AuthGateway {
  signUp(email: string, password: string): Promise<void>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  signInWithGoogle(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  onAuthStateChange(callback: (user: User | null) => void): () => void;
}
