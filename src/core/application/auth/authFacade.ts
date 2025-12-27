import type { User } from '@supabase/supabase-js';
import type { AuthGateway } from '../../domain/auth';

/**
 * Use-case layer for authentication. Keeps presentation hooked to an interface instead of Supabase.
 */
export interface AuthFacade {
  signUp(email: string, password: string): Promise<void>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  signInWithGoogle(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  onAuthStateChange(callback: (user: User | null) => void): () => void;
}

export function createAuthFacade(gateway: AuthGateway): AuthFacade {
  return {
    signUp: (email, password) => gateway.signUp(email, password),
    signIn: (email, password) => gateway.signIn(email, password),
    signOut: () => gateway.signOut(),
    signInWithGoogle: () => gateway.signInWithGoogle(),
    getCurrentUser: () => gateway.getCurrentUser(),
    onAuthStateChange: (callback) => gateway.onAuthStateChange(callback),
  };
}
