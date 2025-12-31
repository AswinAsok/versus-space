import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Viewer {
  id: string;
  color: string;
  joinedAt: string;
}

interface UseLiveViewersOptions {
  pollId: string | undefined;
  enabled?: boolean;
}

interface UseLiveViewersReturn {
  viewers: Viewer[];
  viewerCount: number;
  isConnected: boolean;
  recentJoins: number; // How many joined in the last 5 seconds
}

// Generate a consistent color based on viewer ID
const getViewerColor = (id: string): string => {
  const colors = [
    '#3ecf8e', // Green (primary)
    '#a855f7', // Purple
    '#60a5fa', // Blue
    '#fbbf24', // Yellow
    '#f87171', // Red
    '#22d3ee', // Cyan
    '#f472b6', // Pink
    '#a3e635', // Lime
    '#fb923c', // Orange
  ];

  // Simple hash function to get consistent color per viewer
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash = hash & hash;
  }

  return colors[Math.abs(hash) % colors.length];
};

// Generate a unique viewer ID that persists across page reloads
const getOrCreateViewerId = (): string => {
  const storageKey = 'versus_viewer_id';
  let viewerId = sessionStorage.getItem(storageKey);

  if (!viewerId) {
    viewerId = crypto.randomUUID();
    sessionStorage.setItem(storageKey, viewerId);
  }

  return viewerId;
};

export function useLiveViewers({ pollId, enabled = true }: UseLiveViewersOptions): UseLiveViewersReturn {
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [recentJoins, setRecentJoins] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const viewerIdRef = useRef<string>(getOrCreateViewerId());
  const recentJoinTimeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  const trackRecentJoin = useCallback(() => {
    setRecentJoins(prev => prev + 1);
    const timeout = setTimeout(() => {
      setRecentJoins(prev => Math.max(0, prev - 1));
      recentJoinTimeoutsRef.current.delete(timeout);
    }, 5000);
    recentJoinTimeoutsRef.current.add(timeout);
  }, []);

  useEffect(() => {
    if (!pollId || !enabled) {
      setViewers([]);
      setIsConnected(false);
      return;
    }

    const channelName = `live-viewers:${pollId}`;
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: viewerIdRef.current,
        },
      },
    });

    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const viewerList: Viewer[] = [];

        Object.entries(presenceState).forEach(([key, presences]) => {
          if (presences && presences.length > 0) {
            const presence = presences[0] as { viewerId?: string; joinedAt?: string };
            viewerList.push({
              id: presence.viewerId || key,
              color: getViewerColor(presence.viewerId || key),
              joinedAt: presence.joinedAt || new Date().toISOString(),
            });
          }
        });

        setViewers(viewerList);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        // Track new joins for the animation
        if (newPresences && newPresences.length > 0) {
          const newViewerId = (newPresences[0] as { viewerId?: string }).viewerId;
          // Don't count our own join
          if (newViewerId !== viewerIdRef.current) {
            trackRecentJoin();
          }
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          // Track our presence
          await channel.track({
            viewerId: viewerIdRef.current,
            joinedAt: new Date().toISOString(),
          });
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
        }
      });

    return () => {
      // Clean up recent join timeouts
      recentJoinTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      recentJoinTimeoutsRef.current.clear();

      // Unsubscribe from channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [pollId, enabled, trackRecentJoin]);

  return {
    viewers,
    viewerCount: viewers.length,
    isConnected,
    recentJoins,
  };
}
