import { useState, useEffect, useRef } from 'react';
import { realtimeFacade } from '../core/appServices';

interface UseLiveViewersOptions {
  pollId: string | undefined;
  enabled?: boolean;
}

interface UseLiveViewersReturn {
  viewerCount: number;
  isConnected: boolean;
}

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
  const [viewerCount, setViewerCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const viewerIdRef = useRef<string>(getOrCreateViewerId());

  useEffect(() => {
    if (!pollId || !enabled) {
      setViewerCount(0);
      setIsConnected(false);
      return;
    }

    const unsubscribe = realtimeFacade.subscribeToPolls([pollId], {
      role: 'viewer',
      viewerId: viewerIdRef.current,
      onConnected: setIsConnected,
      onPresence: (_, nextViewerCount) => setViewerCount(nextViewerCount),
    });

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [pollId, enabled]);

  return {
    viewerCount,
    isConnected,
  };
}
