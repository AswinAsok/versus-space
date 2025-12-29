import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Poll,
  PollOption,
  PollWithOptions,
  CreatePollData,
  LeaderboardPoll,
  PlatformStats,
} from '../../../types';
import type { Database } from '../../../types/database';
import type { PollGateway } from '../../domain/polls';
import { generateUniqueSlug } from '../../../utils/slug';

export function createSupabasePollGateway(client: SupabaseClient<Database>): PollGateway {
  return {
    async createPoll(data, userId) {
      const slug = generateUniqueSlug(data.title);

      const { data: poll, error: pollError } = await client
        .from('polls')
        .insert({
          title: data.title,
          slug,
          creator_id: userId,
          is_active: true,
          is_public: data.is_public,
          access_key: data.is_public ? null : data.access_key || null,
          ends_at: data.ends_at ?? null,
          max_votes_per_ip: data.max_votes_per_ip ?? null,
          auto_vote_interval_seconds: data.auto_vote_interval_seconds ?? 30,
        })
        .select()
        .single();

      if (pollError) throw pollError;
      if (!poll) throw new Error('Failed to create poll');

      const optionsToInsert = data.options.map((option) => ({
        poll_id: poll.id,
        title: option.title,
        image_url: option.image_url,
        position: option.position,
        vote_count: 0,
        simulated_enabled: option.simulated_enabled ?? false,
        simulated_target_votes: option.simulated_target_votes ?? null,
        simulated_votes_added: 0,
      }));

      const { data: options, error: optionsError } = await client
        .from('poll_options')
        .insert(optionsToInsert)
        .select();

      if (optionsError) throw optionsError;

      return {
        ...poll,
        options: options || [],
      };
    },

    async getPoll(pollId) {
      const { data: poll, error: pollError } = await client
        .from('polls')
        .select('*')
        .eq('id', pollId)
        .maybeSingle();

      if (pollError) throw pollError;
      if (!poll) return null;

      const { data: options, error: optionsError } = await client
        .from('poll_options')
        .select('*')
        .eq('poll_id', pollId)
        .order('position');

      if (optionsError) throw optionsError;

      return {
        ...poll,
        options: options ?? [],
      };
    },

    async getPollBySlug(slug) {
      const { data: poll, error: pollError } = await client
        .from('polls')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (pollError) throw pollError;
      if (!poll) return null;

      const { data: options, error: optionsError } = await client
        .from('poll_options')
        .select('*')
        .eq('poll_id', poll.id)
        .order('position');

      if (optionsError) throw optionsError;

      return {
        ...poll,
        options: options ?? [],
      };
    },

    async getUserPolls(userId) {
      const { data, error } = await client
        .from('polls')
        .select('*')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    async updatePollStatus(pollId, isActive) {
      const { error } = await client.from('polls').update({ is_active: isActive }).eq('id', pollId);
      if (error) throw error;
    },

    async deletePoll(pollId) {
      const { error } = await client.from('polls').delete().eq('id', pollId);
      if (error) throw error;
    },

    subscribeToPollOptions(pollId, applyOptions) {
      const channel = client
        .channel(`poll_options:${pollId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'poll_options',
            filter: `poll_id=eq.${pollId}`,
          },
          (payload) => {
            applyOptions((prev: PollOption[]) => {
              const next = [...prev];
              const newRow = payload.new as PollOption | null;
              const oldRow = payload.old as PollOption | null;

              if (payload.eventType === 'INSERT' && newRow) {
                next.push(newRow);
              } else if (payload.eventType === 'UPDATE' && newRow) {
                const idx = next.findIndex((opt) => opt.id === newRow.id);
                if (idx >= 0) next[idx] = newRow;
              } else if (payload.eventType === 'DELETE' && oldRow) {
                return next.filter((opt) => opt.id !== oldRow.id);
              }

              return next.sort((a, b) => a.position - b.position);
            });
          }
        )
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    },

    async getLeaderboard(limit = 10) {
      const { data, error } = await client.from('public_poll_leaderboard').select('*').limit(limit);
      if (error) throw error;
      return data || [];
    },

    async getMostRecentPoll() {
      const { data, error } = await client
        .from('public_poll_leaderboard')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as LeaderboardPoll | null;
    },

    async validateAccessKey(pollId, accessKey) {
      const { data, error } = await client
        .from('polls')
        .select('access_key')
        .eq('id', pollId)
        .single();

      if (error) throw error;
      return data?.access_key === accessKey;
    },

    async isPollPublic(pollId) {
      const { data, error } = await client
        .from('polls')
        .select('is_public, access_key')
        .eq('id', pollId)
        .single();

      if (error) throw error;
      return {
        isPublic: data?.is_public ?? true,
        requiresKey: !data?.is_public && !!data?.access_key,
      };
    },

    async getPlatformStats() {
      const [pollsResult, votesResult] = await Promise.all([
        client.from('polls').select('*', { count: 'exact', head: true }),
        client.from('votes').select('*', { count: 'exact', head: true }),
      ]);

      if (pollsResult.error) throw pollsResult.error;
      if (votesResult.error) throw votesResult.error;

      return {
        pollsCount: pollsResult.count ?? 0,
        votesCount: votesResult.count ?? 0,
      } satisfies PlatformStats;
    },

    subscribeToPlatformStats(applyStats, onNewVote) {
      const channel = client
        .channel('platform-stats')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'polls' },
          (payload) => {
            applyStats((prev) => {
              if (payload.eventType === 'INSERT') {
                return { ...prev, pollsCount: prev.pollsCount + 1 };
              }
              if (payload.eventType === 'DELETE') {
                return { ...prev, pollsCount: Math.max(0, prev.pollsCount - 1) };
              }
              return prev;
            });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'votes' },
          (payload) => {
            applyStats((prev) => {
              if (payload.eventType === 'INSERT') {
                onNewVote?.();
                return { ...prev, votesCount: prev.votesCount + 1 };
              }
              if (payload.eventType === 'DELETE') {
                return { ...prev, votesCount: Math.max(0, prev.votesCount - 1) };
              }
              return prev;
            });
          }
        )
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    },
  };
}
