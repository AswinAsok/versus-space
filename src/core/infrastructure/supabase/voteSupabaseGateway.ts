import type { SupabaseClient } from '@supabase/supabase-js';
import type { VoteGateway, VoteAuthenticityStats } from '../../domain/votes';
import type { Database } from '../../../types/database';
import type { Vote, UserSession, VoteDailyCount, PollVoteSummary } from '../../../types';

export function createSupabaseVoteGateway(client: SupabaseClient<Database>): VoteGateway {
  return {
    async castVote(pollId, optionId, userId, ipAddress) {
      // Call RPC for validation + vote insert. poll_options.vote_count is incremented by the
      // on_vote_created trigger, so the RPC must not bump it to avoid double-counting.
      const { error } = await client.rpc('cast_vote_with_limits', {
        p_poll_id: pollId,
        p_option_id: optionId,
        p_user_id: userId,
        p_ip_address: ipAddress,
      });

      if (error) throw error;

      // REMOVED: Duplicate insert that was causing triple-counting due to database triggers
      // The RPC handles the insert and triggers handle the counter updates.
    },

    async updateUserSession(userId, pollId) {
      const { error } = await client.rpc('increment_user_session_votes', {
        p_user_id: userId,
        p_poll_id: pollId,
      });

      if (error) throw error;
    },

    async getUserSession(userId, pollId) {
      const { data, error } = await client
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('poll_id', pollId)
        .maybeSingle();

      if (error) throw error;
      return data as UserSession | null;
    },

    async getVoteStats(pollId, since) {
      const { data, error } = await client
        .from('votes')
        .select('option_id')
        .eq('poll_id', pollId)
        .gte('created_at', since.toISOString());

      if (error) throw error;
      return (data as Pick<Vote, 'option_id'>[]) || [];
    },

    async getVotesOverTime(pollIds, days) {
      if (pollIds.length === 0) return new Map();

      const formatDateKey = (date: Date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const formatHourKey = (date: Date) =>
        `${formatDateKey(date)}-${String(date.getHours()).padStart(2, '0')}`;

      // Build the time buckets that match what the chart expects
      const bucketKeys: string[] = [];
      if (days === 1) {
        const now = new Date();
        for (let i = 23; i >= 0; i--) {
          const hour = new Date(now);
          hour.setHours(now.getHours() - i, 0, 0, 0);
          bucketKeys.push(formatHourKey(hour));
        }
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          bucketKeys.push(formatDateKey(date));
        }
      }

      const startDate = (() => {
        if (days === 1) {
          const start = new Date();
          start.setMinutes(0, 0, 0);
          start.setHours(start.getHours() - 23);
          return start;
        }
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() - (days - 1));
        return start;
      })();

      // Get timezone offset in minutes (negative because getTimezoneOffset returns opposite sign)
      const tzOffsetMinutes = -new Date().getTimezoneOffset();

      // Use RPC function for efficient aggregation
      const { data, error } = await client.rpc('get_votes_over_time', {
        p_poll_ids: pollIds,
        p_start_date: startDate.toISOString(),
        p_group_by_hour: days === 1,
        p_tz_offset_minutes: tzOffsetMinutes,
      });

      if (error) throw error;

      // Pre-seed buckets for all polls
      const votesByPoll = new Map<string, Map<string, number>>();
      pollIds.forEach((pollId) => {
        votesByPoll.set(
          pollId,
          new Map(bucketKeys.map((key) => [key, 0]))
        );
      });

      // Place aggregated vote counts into buckets
      (data || []).forEach((row: { poll_id: string; time_bucket: string; vote_count: number }) => {
        const pollBuckets = votesByPoll.get(row.poll_id);
        if (pollBuckets && pollBuckets.has(row.time_bucket)) {
          pollBuckets.set(row.time_bucket, row.vote_count);
        }
      });

      // Build result
      const result = new Map<string, VoteDailyCount[]>();
      votesByPoll.forEach((buckets, pollId) => {
        const counts: VoteDailyCount[] = bucketKeys.map((key) => ({
          date: key,
          count: buckets.get(key) || 0,
        }));
        result.set(pollId, counts);
      });

      return result;
    },

    async getTotalVotesForPolls(pollIds) {
      if (pollIds.length === 0) return [];

      // Get polls with their titles and options (which have vote_count)
      const { data: polls, error: pollsError } = await client
        .from('polls')
        .select('id, title')
        .in('id', pollIds);

      if (pollsError) throw pollsError;

      // Get vote counts from poll_options (includes simulated votes)
      const { data: options, error: optionsError } = await client
        .from('poll_options')
        .select('poll_id, vote_count')
        .in('poll_id', pollIds);

      if (optionsError) throw optionsError;

      // Sum vote counts per poll from options
      const voteCounts = new Map<string, number>();
      (options || []).forEach((option) => {
        const current = voteCounts.get(option.poll_id) || 0;
        voteCounts.set(option.poll_id, current + (option.vote_count || 0));
      });

      // Build result
      return (polls || []).map((poll) => ({
        pollId: poll.id,
        pollTitle: poll.title,
        totalVotes: voteCounts.get(poll.id) || 0,
      })) satisfies PollVoteSummary[];
    },

    async getVoteTimestamps(pollIds, days) {
      if (pollIds.length === 0) return [];

      const startDate = (() => {
        if (days === 1) {
          const start = new Date();
          start.setMinutes(0, 0, 0);
          start.setHours(start.getHours() - 23);
          return start;
        }
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() - (days - 1));
        return start;
      })();

      // Use RPC function to get aggregated counts by date (much faster)
      const { data, error } = await client.rpc('get_vote_counts_by_date', {
        p_poll_ids: pollIds,
        p_start_date: startDate.toISOString(),
      });

      if (error) throw error;

      // Convert aggregated data back to timestamps for compatibility
      // Create one timestamp per vote on each date
      const allTimestamps: Date[] = [];
      (data || []).forEach((row: { vote_date: string; vote_count: number }) => {
        const date = new Date(row.vote_date);
        for (let i = 0; i < row.vote_count; i++) {
          allTimestamps.push(date);
        }
      });

      return allTimestamps;
    },

    async getVoteAuthenticityStats(pollIds) {
      if (pollIds.length === 0) return { realVotes: 0, simulatedVotes: 0 };

      // Use poll_options.vote_count as source of truth (all votes are real)
      const { data, error } = await client
        .from('poll_options')
        .select('vote_count')
        .in('poll_id', pollIds);

      if (error) throw error;

      const totalVotes = (data || []).reduce(
        (sum, option) => sum + (option.vote_count || 0),
        0
      );

      // All votes are real (simulated votes have been converted)
      return {
        realVotes: totalVotes,
        simulatedVotes: 0,
      } satisfies VoteAuthenticityStats;
    },
  };
}
