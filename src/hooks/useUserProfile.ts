import { useQuery } from '@tanstack/react-query';
import type { User } from '@supabase/supabase-js';
import { userProfileFacade } from '../core/appServices';
import type { UserProfile } from '../types';

export function useUserProfile(user: User | null) {
  const userId = user?.id;
  const email = user?.email ?? null;

  return useQuery<UserProfile>({
    queryKey: ['user-profile', userId],
    queryFn: () => userProfileFacade.getOrCreateProfile(userId!, email),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}
