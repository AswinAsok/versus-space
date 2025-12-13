import { supabase } from '../lib/supabaseClient';
import type { Poll, PollOption, PollWithOptions, CreatePollData, LeaderboardPoll } from '../types';

/**
 * Encapsulates all poll-related persistence logic to keep components focused on UI concerns.
 */
export class PollService {
  async createPoll(data: CreatePollData, userId: string): Promise<PollWithOptions> {
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        title: data.title,
        creator_id: userId,
        is_active: true,
        is_public: data.is_public,
        access_key: data.is_public ? null : data.access_key || null,
      })
      .select()
      .single();

    if (pollError) throw pollError;

    const optionsToInsert = data.options.map((option) => ({
      poll_id: poll.id,
      title: option.title,
      image_url: option.image_url,
      position: option.position,
      vote_count: 0,
    }));

    const { data: options, error: optionsError } = await supabase
      .from('poll_options')
      .insert(optionsToInsert)
      .select();

    if (optionsError) throw optionsError;

    return {
      ...poll,
      options: options || [],
    };
  }

  async getPoll(pollId: string): Promise<PollWithOptions | null> {
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('*')
      .eq('id', pollId)
      .maybeSingle();

    if (pollError) throw pollError;
    if (!poll) return null;

    const { data: options, error: optionsError } = await supabase
      .from('poll_options')
      .select('*')
      .eq('poll_id', pollId)
      .order('position');

    if (optionsError) throw optionsError;

    return {
      ...poll,
      options: options || [],
    };
  }

  async getUserPolls(userId: string): Promise<Poll[]> {
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updatePollStatus(pollId: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('polls')
      .update({ is_active: isActive })
      .eq('id', pollId);

    if (error) throw error;
  }

  async deletePoll(pollId: string): Promise<void> {
    const { error } = await supabase
      .from('polls')
      .delete()
      .eq('id', pollId);

    if (error) throw error;
  }

  // Maintain a realtime subscription so consumers can react to option updates.
  subscribeToPollOptions(
    pollId: string,
    applyOptions: (updater: (prev: PollOption[]) => PollOption[]) => void
  ) {
    const channel = supabase
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
          applyOptions((prev) => {
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
      supabase.removeChannel(channel);
    };
  }

  async getLeaderboard(limit: number = 10): Promise<LeaderboardPoll[]> {
    const { data, error } = await supabase
      .from('public_poll_leaderboard')
      .select('*')
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async validateAccessKey(pollId: string, accessKey: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('polls')
      .select('access_key')
      .eq('id', pollId)
      .single();

    if (error) throw error;
    return data?.access_key === accessKey;
  }

  async isPollPublic(pollId: string): Promise<{ isPublic: boolean; requiresKey: boolean }> {
    const { data, error } = await supabase
      .from('polls')
      .select('is_public, access_key')
      .eq('id', pollId)
      .single();

    if (error) throw error;
    return {
      isPublic: data?.is_public ?? true,
      requiresKey: !data?.is_public && !!data?.access_key,
    };
  }
}

export const pollService = new PollService();
