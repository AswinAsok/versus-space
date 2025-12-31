import type { SupabaseClient } from '@supabase/supabase-js';
import type { PollOption, CreatePollData, UpdatePollData, LeaderboardPoll, PlatformStats } from '../../../types';
import type { Database } from '../../../types/database';
import type { PollGateway } from '../../domain/polls';
import { generateUniqueSlug } from '../../../utils/slug';
import { FREE_PLAN_POLL_LIMIT } from '../../../config/plans';

const AUTO_VOTE_INTERVAL_MIN_MS = 200;
const AUTO_VOTE_INTERVAL_MAX_MS = 300000; // 5 minutes
const AUTO_VOTE_INTERVAL_DEFAULT_MS = 30000; // 30 seconds

function normalizeAutoVoteIntervalMs(value?: number | null) {
  if (value === null || value === undefined) {
    return AUTO_VOTE_INTERVAL_DEFAULT_MS;
  }

  // Legacy data may be stored as seconds. If it's below the min ms value, treat it as seconds and convert.
  const valueAsMs = value < AUTO_VOTE_INTERVAL_MIN_MS ? value * 1000 : value;
  if (!Number.isFinite(valueAsMs)) {
    return AUTO_VOTE_INTERVAL_DEFAULT_MS;
  }

  return Math.min(
    AUTO_VOTE_INTERVAL_MAX_MS,
    Math.max(AUTO_VOTE_INTERVAL_MIN_MS, Math.round(valueAsMs))
  );
}

export function createSupabasePollGateway(client: SupabaseClient<Database>): PollGateway {
  return {
    async createPoll(data, userId) {
      const { data: profile, error: profileError } = await client
        .from('user_profiles')
        .select('plan, role')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) throw profileError;

      const isSuperAdmin = profile?.role === 'superadmin';
      const isPro = isSuperAdmin || profile?.plan === 'pro';
      const autoVoteIntervalMs = isPro
        ? normalizeAutoVoteIntervalMs(data.auto_vote_interval_seconds)
        : AUTO_VOTE_INTERVAL_DEFAULT_MS;

      if (!isPro) {
        const { count, error: countError } = await client
          .from('polls')
          .select('*', { count: 'exact', head: true })
          .eq('creator_id', userId);

        if (countError) throw countError;
        if ((count ?? 0) >= FREE_PLAN_POLL_LIMIT) {
          throw new Error(`Free plan limit reached. Upgrade to Pro to create more than ${FREE_PLAN_POLL_LIMIT} polls.`);
        }

        if (!data.is_public) {
          throw new Error('Private polls are available on the Pro plan.');
        }
      }

      const safeData: CreatePollData = {
        ...data,
        is_public: isPro ? data.is_public : true,
        access_key: isPro ? data.access_key : null,
        ends_at: data.ends_at, // Free users get enforced 15-min timer from CreatePoll
        max_votes_per_ip: isPro ? data.max_votes_per_ip : null,
        auto_vote_interval_seconds: autoVoteIntervalMs,
        options: data.options.map((option) => ({
          ...option,
          simulated_enabled: isPro ? option.simulated_enabled : false,
          simulated_target_votes: isPro ? option.simulated_target_votes : null,
        })),
      };

      const slug = generateUniqueSlug(safeData.title);

      const { data: poll, error: pollError } = await client
        .from('polls')
        .insert({
          title: safeData.title,
          slug,
          creator_id: userId,
          is_active: true,
          is_public: safeData.is_public,
          access_key: safeData.is_public ? null : safeData.access_key || null,
          ends_at: safeData.ends_at ?? null,
          max_votes_per_ip: safeData.max_votes_per_ip ?? null,
          auto_vote_interval_seconds: safeData.auto_vote_interval_seconds ?? AUTO_VOTE_INTERVAL_DEFAULT_MS,
        })
        .select()
        .single();

      if (pollError) throw pollError;
      if (!poll) throw new Error('Failed to create poll');

      const optionsToInsert = safeData.options.map((option) => ({
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
      const { data: polls, error: pollsError } = await client
        .from('polls')
        .select('*')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });

      if (pollsError) throw pollsError;
      if (!polls || polls.length === 0) return [];

      // Fetch all options for these polls in a single query
      const pollIds = polls.map((p) => p.id);
      const { data: options, error: optionsError } = await client
        .from('poll_options')
        .select('*')
        .in('poll_id', pollIds)
        .order('position');

      if (optionsError) throw optionsError;

      // Group options by poll_id
      const optionsByPollId = (options || []).reduce((acc, opt) => {
        if (!acc[opt.poll_id]) acc[opt.poll_id] = [];
        acc[opt.poll_id].push(opt);
        return acc;
      }, {} as Record<string, typeof options>);

      // Combine polls with their options
      return polls.map((poll) => ({
        ...poll,
        options: optionsByPollId[poll.id] || [],
      }));
    },

    async getUserPollCount(userId) {
      const { count, error } = await client
        .from('polls')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', userId);

      if (error) throw error;
      return count ?? 0;
    },

    async updatePoll(pollId, data: UpdatePollData) {
      // Update poll fields
      const pollUpdate: Record<string, unknown> = {};
      if (data.title !== undefined) pollUpdate.title = data.title;
      if (data.is_public !== undefined) pollUpdate.is_public = data.is_public;
      if (data.access_key !== undefined) pollUpdate.access_key = data.access_key;
      if (data.ends_at !== undefined) pollUpdate.ends_at = data.ends_at;
      if (data.max_votes_per_ip !== undefined) pollUpdate.max_votes_per_ip = data.max_votes_per_ip;
      if (data.auto_vote_interval_seconds !== undefined)
        pollUpdate.auto_vote_interval_seconds = normalizeAutoVoteIntervalMs(data.auto_vote_interval_seconds);

      if (Object.keys(pollUpdate).length > 0) {
        const { error: pollError } = await client
          .from('polls')
          .update(pollUpdate)
          .eq('id', pollId);
        if (pollError) throw pollError;
      }

      // Update options if provided
      if (data.options) {
        for (const option of data.options) {
          if (option.id) {
            // Update existing option
            const { error } = await client
              .from('poll_options')
              .update({
                title: option.title,
                image_url: option.image_url,
                position: option.position,
                simulated_enabled: option.simulated_enabled ?? false,
                simulated_target_votes: option.simulated_target_votes ?? null,
              })
              .eq('id', option.id);
            if (error) throw error;
          }
        }
      }

      // Fetch and return the updated poll
      const updatedPoll = await this.getPoll(pollId);
      if (!updatedPoll) throw new Error('Poll not found after update');
      return updatedPoll;
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
      const now = new Date().toISOString();
      const { data, error } = await client
        .from('public_poll_leaderboard')
        .select('*')
        .or(`ends_at.is.null,ends_at.gt.${now}`)
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

    async getProUserCount() {
      const { count, error } = await client
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('plan', 'pro')
        .neq('role', 'superadmin');

      if (error) throw error;
      return count ?? 0;
    },
  };
}
