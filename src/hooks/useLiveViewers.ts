import { useState, useEffect, useCallback, useRef } from 'react';
import { realtimeFacade } from '../core/appServices';

interface Viewer {
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
    hash = (hash << 5) - hash + id.charCodeAt(i);
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

export function useLiveViewers({
  pollId,
  enabled = true,
}: UseLiveViewersOptions): UseLiveViewersReturn {
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [recentJoins, setRecentJoins] = useState(0);
  const viewerIdRef = useRef<string>(getOrCreateViewerId());
  const previousViewerIdsRef = useRef<Set<string>>(new Set());
  const recentJoinTimeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  const trackRecentJoin = useCallback(() => {
    setRecentJoins((prev) => prev + 1);
    const timeout = setTimeout(() => {
      setRecentJoins((prev) => Math.max(0, prev - 1));
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

    const recentJoinTimeouts = recentJoinTimeoutsRef.current;
    const unsubscribe = realtimeFacade.subscribeToPolls([pollId], {
      role: 'viewer',
      viewerId: viewerIdRef.current,
      onConnected: setIsConnected,
      onPresence: (_, nextViewers) => {
        const nextIds = new Set(nextViewers.map((viewer) => viewer.id));
        if (
          [...nextIds].some(
            (id) => id !== viewerIdRef.current && !previousViewerIdsRef.current.has(id)
          )
        ) {
          trackRecentJoin();
        }
        previousViewerIdsRef.current = nextIds;
        setViewers(nextViewers.map((viewer) => ({ ...viewer, color: getViewerColor(viewer.id) })));
      },
    });

    return () => {
      // Clean up recent join timeouts
      recentJoinTimeouts.forEach((timeout) => clearTimeout(timeout));
      recentJoinTimeouts.clear();

      unsubscribe();
      previousViewerIdsRef.current.clear();
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
