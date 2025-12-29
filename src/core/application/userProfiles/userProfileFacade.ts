import type { UserProfile } from '../../../types';
import type { UserProfileGateway } from '../../domain/userProfiles';

export interface UserProfileFacade {
  getOrCreateProfile(userId: string, email?: string | null): Promise<UserProfile>;
}

export function createUserProfileFacade(gateway: UserProfileGateway): UserProfileFacade {
  return {
    getOrCreateProfile: (userId, email) => gateway.getOrCreateProfile(userId, email),
  };
}
