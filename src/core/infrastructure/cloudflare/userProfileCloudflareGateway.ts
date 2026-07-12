import type { UserProfile } from '../../../types';
import { api } from '../../../lib/apiClient';

export const cloudflareUserProfileFacade = {
  getOrCreateProfile(_userId: string, _email?: string | null) {
    void _userId;
    void _email;
    return api<UserProfile>('/api/profile');
  },
};
