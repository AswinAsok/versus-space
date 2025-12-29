import type { UserSession, Vote, VoteDailyCount, PollVoteSummary } from '../../types';

export interface VoteAuthenticityStats {
  realVotes: number;
  simulatedVotes: number;
}

export interface VoteGateway {
  castVote(pollId: string, optionId: string, userId: string | null, ipAddress: string): Promise<void>;
  updateUserSession(userId: string, pollId: string): Promise<void>;
  getUserSession(userId: string, pollId: string): Promise<UserSession | null>;
  getVoteStats(pollId: string, since: Date): Promise<Pick<Vote, 'option_id'>[]>;
  getVotesOverTime(pollIds: string[], days: number): Promise<Map<string, VoteDailyCount[]>>;
  getTotalVotesForPolls(pollIds: string[]): Promise<PollVoteSummary[]>;
  getVoteTimestamps(pollIds: string[], days: number): Promise<Date[]>;
  getVoteAuthenticityStats(pollIds: string[]): Promise<VoteAuthenticityStats>;
}
