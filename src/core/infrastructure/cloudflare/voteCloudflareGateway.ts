import type { PollVoteSummary, VoteDailyCount } from '../../../types';
import { api } from '../../../lib/apiClient';

interface AnalyticsSummary {
  pollTotals: Array<{ poll_id: string; poll_title: string; total_votes: number }>;
  votesOverTime: Array<{ poll_id: string; time_bucket: string; vote_count: number }>;
  authenticity: { realVotes: number; simulatedVotes: number };
}

function analytics(days: number) {
  const timezoneOffset = -new Date().getTimezoneOffset();
  return api<AnalyticsSummary>(
    `/api/analytics/summary?days=${days}&tzOffsetMinutes=${timezoneOffset}`
  );
}

function bucketKeys(days: number) {
  const dateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  if (days === 1) {
    return Array.from({ length: 24 }, (_, index) => {
      const hour = new Date();
      hour.setHours(hour.getHours() - (23 - index), 0, 0, 0);
      return `${dateKey(hour)}-${String(hour.getHours()).padStart(2, '0')}`;
    });
  }
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (days - 1 - index));
    return dateKey(date);
  });
}

export const cloudflareVoteFacade = {
  async castVote(pollId: string, optionId: string, sessionId?: string) {
    await api(`/api/polls/${encodeURIComponent(pollId)}/votes`, {
      method: 'POST',
      headers: accessHeaders(pollId),
      body: JSON.stringify({ optionId, sessionId }),
    });
  },

  async getVotesOverTime(pollIds: string[], days: number) {
    if (pollIds.length === 0) return new Map<string, VoteDailyCount[]>();
    const summary = await analytics(days);
    const keys = bucketKeys(days);
    const byPoll = new Map(pollIds.map((pollId) => [pollId, new Map(keys.map((key) => [key, 0]))]));
    for (const row of summary.votesOverTime) {
      byPoll.get(row.poll_id)?.set(row.time_bucket, row.vote_count);
    }
    return new Map(
      [...byPoll].map(([pollId, buckets]) => [
        pollId,
        keys.map((date) => ({ date, count: buckets.get(date) ?? 0 })),
      ])
    );
  },

  async getTotalVotesForPolls(pollIds: string[]) {
    if (pollIds.length === 0) return [];
    const summary = await analytics(1);
    const requested = new Set(pollIds);
    return summary.pollTotals
      .filter((poll) => requested.has(poll.poll_id))
      .map(
        (poll) =>
          ({
            pollId: poll.poll_id,
            pollTitle: poll.poll_title,
            totalVotes: poll.total_votes,
          }) satisfies PollVoteSummary
      );
  },

  async getVoteTimestamps(pollIds: string[], days: number) {
    if (pollIds.length === 0) return [];
    const summary = await analytics(days);
    const requested = new Set(pollIds);
    return summary.votesOverTime.flatMap((row) =>
      requested.has(row.poll_id)
        ? Array.from({ length: row.vote_count }, () => new Date(row.time_bucket))
        : []
    );
  },

  async getVoteAuthenticityStats(pollIds: string[]) {
    if (pollIds.length === 0) return { realVotes: 0, simulatedVotes: 0 };
    return (await analytics(1)).authenticity;
  },

  async getVoteCountsSince(pollIds: string[], since: Date) {
    if (pollIds.length === 0) return new Map<string, number>();
    const rows = await api<Array<{ poll_id: string; vote_count: number }>>(
      `/api/analytics/vote-counts?since=${encodeURIComponent(since.toISOString())}`
    );
    const requested = new Set(pollIds);
    return new Map(
      rows.filter((row) => requested.has(row.poll_id)).map((row) => [row.poll_id, row.vote_count])
    );
  },

  getMomentumStats(pollIds: string[]) {
    if (pollIds.length === 0) {
      return Promise.resolve({ currentHour: 0, previousHour: 0, averageHourly: 0 });
    }
    return api<{ currentHour: number; previousHour: number; averageHourly: number }>(
      '/api/analytics/momentum'
    );
  },
};

function accessHeaders(pollId: string) {
  const key = sessionStorage.getItem(`poll_key_${pollId}`);
  return key ? { 'X-Poll-Access-Key': key } : undefined;
}
