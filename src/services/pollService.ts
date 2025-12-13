import { supabase } from '../lib/supabaseClient';
import type { Poll, PollOption, PollWithOptions, CreatePollData } from '../types';

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
    callback: (options: PollOption[]) => void
  ) {
    const channel = supabase
      .channel(`poll_options:${pollId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'poll_options',
          filter: `poll_id=eq.${pollId}`,
        },
        async () => {
          const { data } = await supabase
            .from('poll_options')
            .select('*')
            .eq('poll_id', pollId)
            .order('position');

          if (data) {
            callback(data);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const pollService = new PollService();
