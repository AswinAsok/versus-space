import type { SupabaseClient } from '@supabase/supabase-js';
import type { VoteGateway } from '../../domain/votes';
import type { Database } from '../../../types/database';
import type { Vote, UserSession } from '../../../types';

export function createSupabaseVoteGateway(client: SupabaseClient<Database>): VoteGateway {
  return {
    async castVote(pollId, optionId, userId, ipAddress) {
      const { error } = await client.rpc('cast_vote_with_limits', {
        p_poll_id: pollId,
        p_option_id: optionId,
        p_user_id: userId,
        p_ip_address: ipAddress,
      });

      if (error) throw error;
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
  };
}
