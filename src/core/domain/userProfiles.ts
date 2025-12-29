import type { UserProfile } from '../../types';

export interface UserProfileGateway {
  getOrCreateProfile(userId: string, email?: string | null): Promise<UserProfile>;
}
