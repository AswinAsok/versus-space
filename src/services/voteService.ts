import { supabase } from '../lib/supabaseClient';

/**
 * Persists votes and user-session metadata, keeping Supabase RPC details contained.
 */
export class VoteService {
  async castVote(pollId: string, optionId: string, userId: string | null): Promise<void> {
    const { error } = await supabase.from('votes').insert({
      poll_id: pollId,
      option_id: optionId,
      user_id: userId,
    });

    if (error) throw error;
  }

  async updateUserSession(userId: string, pollId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_user_session_votes', {
      p_user_id: userId,
      p_poll_id: pollId,
    });

    if (error) throw error;
  }

  async getUserSession(userId: string, pollId: string) {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('poll_id', pollId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getVoteStats(pollId: string, since: Date) {
    const { data, error } = await supabase
      .from('votes')
      .select('option_id')
      .eq('poll_id', pollId)
      .gte('created_at', since.toISOString());

    if (error) throw error;
    return data || [];
  }
}

export const voteService = new VoteService();
