import { useState, useEffect } from 'react';
import { authFacade } from '../core/appServices';
import type { User } from '@supabase/supabase-js';

/**
 * Subscribes to Supabase auth events and surfaces the current user with loading state.
 * Encapsulates auth side-effects so components remain focused on rendering.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    authFacade
      .getCurrentUser()
      .then((user) => {
        if (!isMounted) return;
        setUser(user);
      })
      .catch((error) => {
        console.warn('Failed to restore Supabase session', error);
        if (!isMounted) return;
        setUser(null);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    const unsubscribe = authFacade.onAuthStateChange((user) => {
      if (!isMounted) return;
      setUser(user);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { user, loading };
}
