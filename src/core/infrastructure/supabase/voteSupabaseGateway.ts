import type { SupabaseClient } from '@supabase/supabase-js';
import type { VoteGateway, VoteAuthenticityStats } from '../../domain/votes';
import type { Database } from '../../../types/database';
import type { Vote, UserSession, VoteDailyCount, PollVoteSummary } from '../../../types';

export function createSupabaseVoteGateway(client: SupabaseClient<Database>): VoteGateway {
  return {
    async castVote(pollId, optionId, userId, ipAddress) {
      // Call RPC for rate limiting and counter increment
      const { error } = await client.rpc('cast_vote_with_limits', {
        p_poll_id: pollId,
        p_option_id: optionId,
        p_user_id: userId,
        p_ip_address: ipAddress,
      });

      if (error) throw error;

      // Also insert into votes table for time-series tracking
      const { error: insertError } = await client.from('votes').insert({
        poll_id: pollId,
        option_id: optionId,
        user_id: userId,
        ip_address: ipAddress,
        is_simulated: false,
      });

      // Don't throw on insert error - RPC already succeeded
      if (insertError) {
        console.warn('Failed to insert vote record:', insertError);
      }
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

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await client
        .from('votes')
        .select('poll_id, created_at')
        .in('poll_id', pollIds)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group votes by poll_id and date
      const result = new Map<string, VoteDailyCount[]>();

      // Initialize map for all poll IDs
      pollIds.forEach((pollId) => result.set(pollId, []));

      // Group votes by date
      const votesByPollAndDate = new Map<string, Map<string, number>>();

      (data || []).forEach((vote) => {
        const pollId = vote.poll_id;
        const voteDate = new Date(vote.created_at);

        // For 24h view (days === 1), group by hour; otherwise group by date
        let key: string;
        if (days === 1) {
          // Include hour in the key for hourly grouping
          key = `${voteDate.getFullYear()}-${String(voteDate.getMonth() + 1).padStart(2, '0')}-${String(voteDate.getDate()).padStart(2, '0')}-${String(voteDate.getHours()).padStart(2, '0')}`;
        } else {
          // Daily grouping
          key = `${voteDate.getFullYear()}-${String(voteDate.getMonth() + 1).padStart(2, '0')}-${String(voteDate.getDate()).padStart(2, '0')}`;
        }

        if (!votesByPollAndDate.has(pollId)) {
          votesByPollAndDate.set(pollId, new Map());
        }

        const pollDates = votesByPollAndDate.get(pollId)!;
        pollDates.set(key, (pollDates.get(key) || 0) + 1);
      });

      // Convert to VoteDailyCount arrays
      votesByPollAndDate.forEach((dates, pollId) => {
        const counts: VoteDailyCount[] = [];
        dates.forEach((count, date) => {
          counts.push({ date, count });
        });
        counts.sort((a, b) => a.date.localeCompare(b.date));
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

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await client
        .from('votes')
        .select('created_at')
        .in('poll_id', pollIds)
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      return (data || []).map((vote) => new Date(vote.created_at));
    },

    async getVoteAuthenticityStats(pollIds) {
      if (pollIds.length === 0) return { realVotes: 0, simulatedVotes: 0 };

      const { data, error } = await client
        .from('votes')
        .select('is_simulated')
        .in('poll_id', pollIds);

      if (error) throw error;

      let realVotes = 0;
      let simulatedVotes = 0;

      (data || []).forEach((vote) => {
        if (vote.is_simulated) {
          simulatedVotes++;
        } else {
          realVotes++;
        }
      });

      return { realVotes, simulatedVotes } satisfies VoteAuthenticityStats;
    },
  };
}
