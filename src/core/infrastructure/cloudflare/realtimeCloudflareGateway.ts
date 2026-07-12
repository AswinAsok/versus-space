import type { PollOption, RealtimeViewer, RealtimeVoteEvent } from '../../../types';
import { apiWebSocketUrl, getAuthToken } from '../../../lib/apiClient';

interface SubscribeOptions {
  role: 'viewer' | 'observer';
  viewerId: string;
  onConnected?: (connected: boolean) => void;
  onPresence?: (pollId: string, viewers: RealtimeViewer[]) => void;
  onVote?: (vote: RealtimeVoteEvent) => void;
  onOption?: (pollId: string, option: PollOption) => void;
}

interface RealtimeMessage {
  type: 'presence' | 'vote' | 'refresh' | 'deleted';
  pollId: string;
  viewers?: RealtimeViewer[];
  vote?: RealtimeVoteEvent;
  option?: PollOption;
}

export const cloudflareRealtimeFacade = {
  subscribeToPolls(pollIds: string[], options: SubscribeOptions) {
    let stopped = false;
    const sockets = new Map<string, WebSocket>();
    const connected = new Set<string>();
    const reconnects = new Map<string, number>();

    const updateConnected = () => options.onConnected?.(connected.size > 0);
    const connect = (pollId: string, accessToken: string | null, attempt = 0) => {
      if (stopped) return;
      const query = new URLSearchParams({ role: options.role, viewerId: options.viewerId });
      const accessKey = sessionStorage.getItem(`poll_key_${pollId}`);
      const protocols = ['versus-space'];
      if (accessToken) protocols.push(`auth.${accessToken}`);
      if (accessKey) {
        const encodedKey = [...new TextEncoder().encode(accessKey)]
          .map((byte) => byte.toString(16).padStart(2, '0'))
          .join('');
        protocols.push(`key.${encodedKey}`);
      }
      const socket = new WebSocket(
        apiWebSocketUrl(`/api/realtime/polls/${encodeURIComponent(pollId)}?${query}`),
        protocols
      );
      sockets.set(pollId, socket);

      socket.addEventListener('open', () => {
        connected.add(pollId);
        updateConnected();
      });
      socket.addEventListener('message', (event) => {
        try {
          const message = JSON.parse(String(event.data)) as RealtimeMessage;
          if (message.type === 'presence' && message.viewers) {
            options.onPresence?.(message.pollId, message.viewers);
          } else if (message.type === 'vote' && message.vote && message.option) {
            options.onVote?.(message.vote);
            options.onOption?.(message.pollId, message.option);
          }
        } catch (error) {
          console.warn('Ignored invalid realtime message', error);
        }
      });
      socket.addEventListener('close', () => {
        connected.delete(pollId);
        updateConnected();
        if (!stopped) {
          const timeout = window.setTimeout(
            () => connect(pollId, accessToken, Math.min(attempt + 1, 4)),
            Math.min(1_000 * 2 ** attempt, 10_000)
          );
          reconnects.set(pollId, timeout);
        }
      });
    };

    void getAuthToken()
      .then((accessToken) => {
        [...new Set(pollIds)].forEach((pollId) => connect(pollId, accessToken));
      })
      .catch((error) => {
        console.warn('Failed to initialize realtime authentication', error);
        options.onConnected?.(false);
      });
    return () => {
      stopped = true;
      reconnects.forEach((timeout) => window.clearTimeout(timeout));
      sockets.forEach((socket) => socket.close(1000, 'subscription closed'));
      connected.clear();
      updateConnected();
    };
  },
};
