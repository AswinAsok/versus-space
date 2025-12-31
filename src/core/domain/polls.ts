import type {
  Poll,
  PollOption,
  PollWithOptions,
  CreatePollData,
  UpdatePollData,
  LeaderboardPoll,
  PlatformStats,
} from '../../types';

export interface PollGateway {
  createPoll(data: CreatePollData, userId: string): Promise<PollWithOptions>;
  getPoll(pollId: string): Promise<PollWithOptions | null>;
  getPollBySlug(slug: string): Promise<PollWithOptions | null>;
  getUserPolls(userId: string): Promise<PollWithOptions[]>;
  getUserPollCount(userId: string): Promise<number>;
  updatePoll(pollId: string, data: UpdatePollData): Promise<PollWithOptions>;
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
  getPlatformStats(): Promise<PlatformStats>;
  subscribeToPlatformStats(
    applyStats: (updater: (prev: PlatformStats) => PlatformStats) => void,
    onNewVote?: () => void
  ): () => void;
  getProUserCount(): Promise<number>;
}
