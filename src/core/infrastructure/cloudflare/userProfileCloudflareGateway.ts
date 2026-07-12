import type { UserProfile } from '../../../types';
import { api } from '../../../lib/apiClient';

export const cloudflareUserProfileFacade = {
  getOrCreateProfile() {
    return api<UserProfile>('/api/profile');
  },
};
