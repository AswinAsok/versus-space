import type { UserSession, Vote } from '../../types';

export interface VoteGateway {
  castVote(pollId: string, optionId: string, userId: string | null, ipAddress: string): Promise<void>;
  updateUserSession(userId: string, pollId: string): Promise<void>;
  getUserSession(userId: string, pollId: string): Promise<UserSession | null>;
  getVoteStats(pollId: string, since: Date): Promise<Pick<Vote, 'option_id'>[]>;
}
