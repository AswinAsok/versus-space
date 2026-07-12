import type { RealtimeChannel } from '@supabase/supabase-js';
import type { PollOption, RealtimeViewer, RealtimeVoteEvent } from '../../../types';
import { supabase } from '../../../lib/supabaseClient';

interface SubscribeOptions {
  role: 'viewer' | 'observer';
  viewerId: string;
  onConnected?: (connected: boolean) => void;
  onPresence?: (pollId: string, viewers: RealtimeViewer[]) => void;
  onVote?: (vote: RealtimeVoteEvent) => void;
  onOption?: (pollId: string, option: PollOption) => void;
}

export const supabaseRealtimeFacade = {
  subscribeToPolls(pollIds: string[], options: SubscribeOptions) {
    const pollSet = new Set(pollIds);
    const channels: RealtimeChannel[] = [];
    if (pollSet.size === 0) return () => options.onConnected?.(false);

    for (const pollId of pollSet) {
      const channel = supabase.channel(`poll-presence:${pollId}`, {
        config: { presence: { key: options.viewerId } },
      });
      channel
        .on('presence', { event: 'sync' }, () => {
          const viewers = Object.values(channel.presenceState())
            .flat()
            .filter((presence) => (presence as { role?: string }).role !== 'observer')
            .map((presence) => {
              const viewer = presence as { viewerId?: string; joinedAt?: string };
              return {
                id: viewer.viewerId ?? 'unknown',
                joinedAt: viewer.joinedAt ?? new Date().toISOString(),
              };
            });
          options.onPresence?.(pollId, viewers);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            options.onConnected?.(true);
            await channel.track({
              viewerId: options.viewerId,
              role: options.role,
              joinedAt: new Date().toISOString(),
            });
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            options.onConnected?.(false);
          }
        });
      channels.push(channel);
    }

    const changes = supabase
      .channel(`poll-events:${crypto.randomUUID()}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes' },
        async (payload) => {
          const vote = payload.new as { poll_id: string; option_id: string; is_simulated: boolean };
          if (!pollSet.has(vote.poll_id)) return;
          const { data: option } = await supabase
            .from('poll_options')
            .select('title')
            .eq('id', vote.option_id)
            .maybeSingle();
          options.onVote?.({
            pollId: vote.poll_id,
            optionId: vote.option_id,
            optionTitle: option?.title ?? 'Unknown',
            isSimulated: vote.is_simulated,
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'poll_options' },
        (payload) => {
          const option = payload.new as PollOption;
          if (pollSet.has(option.poll_id)) options.onOption?.(option.poll_id, option);
        }
      )
      .subscribe();
    channels.push(changes);

    return () => {
      channels.forEach((channel) => void supabase.removeChannel(channel));
      options.onConnected?.(false);
    };
  },
};
