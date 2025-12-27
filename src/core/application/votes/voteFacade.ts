import type { UserSession, Vote } from '../../../types';
import type { VoteGateway } from '../../domain/votes';

export interface VoteFacade {
  castVote(pollId: string, optionId: string, userId: string | null, ipAddress: string): Promise<void>;
  updateUserSession(userId: string, pollId: string): Promise<void>;
  getUserSession(userId: string, pollId: string): Promise<UserSession | null>;
  getVoteStats(pollId: string, since: Date): Promise<Pick<Vote, 'option_id'>[]>;
}

export function createVoteFacade(gateway: VoteGateway): VoteFacade {
  return {
    castVote: (pollId, optionId, userId, ipAddress) =>
      gateway.castVote(pollId, optionId, userId, ipAddress),
    updateUserSession: (userId, pollId) => gateway.updateUserSession(userId, pollId),
    getUserSession: (userId, pollId) => gateway.getUserSession(userId, pollId),
    getVoteStats: (pollId, since) => gateway.getVoteStats(pollId, since),
  };
}
