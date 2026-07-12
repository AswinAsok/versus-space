import type {
  CreatePollData,
  LeaderboardPoll,
  PlatformStats,
  PollOption,
  PollWithOptions,
  UpdatePollData,
} from '../../../types';
import { api, ApiError } from '../../../lib/apiClient';
import { cloudflareRealtimeFacade } from './realtimeCloudflareGateway';

function storedAccessKey(pollId: string) {
  return typeof sessionStorage === 'undefined'
    ? null
    : sessionStorage.getItem(`poll_key_${pollId}`);
}

async function pollRequest(path: string) {
  try {
    const poll = await api<PollWithOptions & { requires_access?: boolean }>(path);
    const key = poll.requires_access ? storedAccessKey(poll.id) : null;
    return key ? api<PollWithOptions>(path, { headers: { 'X-Poll-Access-Key': key } }) : poll;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export const cloudflarePollFacade = {
  createPoll(data: CreatePollData) {
    return api<PollWithOptions>('/api/polls', { method: 'POST', body: JSON.stringify(data) });
  },

  getPoll(pollId: string) {
    return pollRequest(`/api/polls/${encodeURIComponent(pollId)}`);
  },

  getPollBySlug(slug: string) {
    return pollRequest(`/api/polls/slug/${encodeURIComponent(slug)}`);
  },

  getUserPolls() {
    return api<PollWithOptions[]>('/api/polls');
  },

  async getUserPollCount() {
    return (await cloudflarePollFacade.getUserPolls()).length;
  },

  updatePoll(pollId: string, data: UpdatePollData) {
    return api<PollWithOptions>(`/api/polls/${encodeURIComponent(pollId)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async updatePollStatus(pollId: string, isActive: boolean) {
    await api(`/api/polls/${encodeURIComponent(pollId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    });
  },

  async deletePoll(pollId: string) {
    await api(`/api/polls/${encodeURIComponent(pollId)}`, { method: 'DELETE' });
  },

  subscribeToPollOptions(
    pollId: string,
    applyOptions: (updater: (previous: PollOption[]) => PollOption[]) => void
  ) {
    return cloudflareRealtimeFacade.subscribeToPolls([pollId], {
      role: 'observer',
      viewerId: `poll-options-${crypto.randomUUID()}`,
      onConnected: (connected) => {
        if (!connected) return;
        void cloudflarePollFacade
          .getPoll(pollId)
          .then((poll) => {
            if (poll) applyOptions(() => poll.options);
          })
          .catch((error) => console.warn('Failed to refresh poll options', error));
      },
      onOption: (_, option) =>
        applyOptions((previous) =>
          previous.map((current) => (current.id === option.id ? option : current))
        ),
    });
  },

  getLeaderboard(limit = 10) {
    return api<LeaderboardPoll[]>(`/api/leaderboard?limit=${limit}`);
  },

  getMostRecentPoll() {
    return api<LeaderboardPoll | null>('/api/polls/recent');
  },

  async validateAccessKey(pollId: string, accessKey: string) {
    const poll = await api<PollWithOptions & { requires_access?: boolean }>(
      `/api/polls/${encodeURIComponent(pollId)}`,
      { headers: { 'X-Poll-Access-Key': accessKey } }
    );
    return poll.requires_access !== true;
  },

  async isPollPublic(pollId: string) {
    const poll = await cloudflarePollFacade.getPoll(pollId);
    if (!poll) throw new ApiError(404, 'Poll not found');
    return { isPublic: poll.is_public, requiresKey: !poll.is_public };
  },

  getPlatformStats() {
    return api<PlatformStats>('/api/stats');
  },

  subscribeToPlatformStats(
    applyStats: (updater: (previous: PlatformStats) => PlatformStats) => void,
    onNewVote?: () => void
  ) {
    let previousVotes: number | null = null;
    const interval = window.setInterval(async () => {
      try {
        const stats = await cloudflarePollFacade.getPlatformStats();
        if (previousVotes !== null && stats.votesCount > previousVotes) onNewVote?.();
        previousVotes = stats.votesCount;
        applyStats(() => stats);
      } catch (error) {
        console.warn('Failed to refresh platform stats', error);
      }
    }, 5_000);
    return () => window.clearInterval(interval);
  },

  getProUserCount() {
    return api<number>('/api/pro-users/count');
  },
};
