import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import type { User } from '@supabase/supabase-js';

/**
 * Subscribes to Supabase auth events and surfaces the current user with loading state.
 * Encapsulates auth side-effects so components remain focused on rendering.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getCurrentUser().then((user) => {
      setUser(user);
      setLoading(false);
    });

    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}
