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
    const { error } = await supabase
      .from('user_sessions')
      .upsert(
        {
          user_id: userId,
          poll_id: pollId,
          total_votes: 1,
          last_vote_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,poll_id',
          ignoreDuplicates: false,
        }
      );

    if (!error) {
      const { error: updateError } = await supabase.rpc('increment', {
        row_id: `${userId}_${pollId}`,
      });

      if (updateError) {
        const { data: session } = await supabase
          .from('user_sessions')
          .select('total_votes')
          .eq('user_id', userId)
          .eq('poll_id', pollId)
          .maybeSingle();

        if (session) {
          await supabase
            .from('user_sessions')
            .update({
              total_votes: session.total_votes + 1,
              last_vote_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
            .eq('poll_id', pollId);
        }
      }
    }
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
