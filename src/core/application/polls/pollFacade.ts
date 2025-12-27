import type {
  Poll,
  PollOption,
  PollWithOptions,
  CreatePollData,
  LeaderboardPoll,
} from '../../../types';
import type { PollGateway } from '../../domain/polls';

/**
 * Application/service layer for polls. Wraps gateway calls so UI is decoupled from persistence.
 */
export interface PollFacade {
  createPoll(data: CreatePollData, userId: string): Promise<PollWithOptions>;
  getPoll(pollId: string): Promise<PollWithOptions | null>;
  getUserPolls(userId: string): Promise<Poll[]>;
  updatePollStatus(pollId: string, isActive: boolean): Promise<void>;
  deletePoll(pollId: string): Promise<void>;
  subscribeToPollOptions(
    pollId: string,
    applyOptions: (updater: (prev: PollOption[]) => PollOption[]) => void
  ): () => void;
  getLeaderboard(limit?: number): Promise<LeaderboardPoll[]>;
  getMostRecentPoll(): Promise<LeaderboardPoll | null>;
  validateAccessKey(pollId: string, accessKey: string): Promise<boolean>;
  isPollPublic(pollId: string): Promise<{ isPublic: boolean; requiresKey: boolean }>;
  getPlatformStats(): Promise<{ pollsCount: number; votesCount: number }>;
}

export function createPollFacade(gateway: PollGateway): PollFacade {
  return {
    createPoll: (data, userId) => gateway.createPoll(data, userId),
    getPoll: (pollId) => gateway.getPoll(pollId),
    getUserPolls: (userId) => gateway.getUserPolls(userId),
    updatePollStatus: (pollId, isActive) => gateway.updatePollStatus(pollId, isActive),
    deletePoll: (pollId) => gateway.deletePoll(pollId),
    subscribeToPollOptions: (pollId, applyOptions) =>
      gateway.subscribeToPollOptions(pollId, applyOptions),
    getLeaderboard: (limit) => gateway.getLeaderboard(limit),
    getMostRecentPoll: () => gateway.getMostRecentPoll(),
    validateAccessKey: (pollId, accessKey) => gateway.validateAccessKey(pollId, accessKey),
    isPollPublic: (pollId) => gateway.isPollPublic(pollId),
    getPlatformStats: () => gateway.getPlatformStats(),
  };
}
