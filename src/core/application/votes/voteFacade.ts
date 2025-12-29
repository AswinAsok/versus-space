import type { UserSession, Vote, VoteDailyCount, PollVoteSummary } from '../../../types';
import type { VoteGateway, VoteAuthenticityStats } from '../../domain/votes';

export interface VoteFacade {
  castVote(pollId: string, optionId: string, userId: string | null, ipAddress: string): Promise<void>;
  updateUserSession(userId: string, pollId: string): Promise<void>;
  getUserSession(userId: string, pollId: string): Promise<UserSession | null>;
  getVoteStats(pollId: string, since: Date): Promise<Pick<Vote, 'option_id'>[]>;
  getVotesOverTime(pollIds: string[], days: number): Promise<Map<string, VoteDailyCount[]>>;
  getTotalVotesForPolls(pollIds: string[]): Promise<PollVoteSummary[]>;
  getVoteTimestamps(pollIds: string[], days: number): Promise<Date[]>;
  getVoteAuthenticityStats(pollIds: string[]): Promise<VoteAuthenticityStats>;
}

export function createVoteFacade(gateway: VoteGateway): VoteFacade {
  return {
    castVote: (pollId, optionId, userId, ipAddress) =>
      gateway.castVote(pollId, optionId, userId, ipAddress),
    updateUserSession: (userId, pollId) => gateway.updateUserSession(userId, pollId),
    getUserSession: (userId, pollId) => gateway.getUserSession(userId, pollId),
    getVoteStats: (pollId, since) => gateway.getVoteStats(pollId, since),
    getVotesOverTime: (pollIds, days) => gateway.getVotesOverTime(pollIds, days),
    getTotalVotesForPolls: (pollIds) => gateway.getTotalVotesForPolls(pollIds),
    getVoteTimestamps: (pollIds, days) => gateway.getVoteTimestamps(pollIds, days),
    getVoteAuthenticityStats: (pollIds) => gateway.getVoteAuthenticityStats(pollIds),
  };
}
