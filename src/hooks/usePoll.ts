import { useState, useEffect } from 'react';
import { pollService } from '../services/pollService';
import type { PollWithOptions, PollOption } from '../types';

/**
 * Retrieves a poll, keeps it updated via realtime subscription, and exposes status flags.
 * This hook isolates data-fetching concerns from the rendering layer.
 */
export function usePoll(pollId: string | undefined) {
  const [poll, setPoll] = useState<PollWithOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pollId) {
      setLoading(false);
      return;
    }

    pollService
      .getPoll(pollId)
      .then((data) => {
        setPoll(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    const unsubscribe = pollService.subscribeToPollOptions(
      pollId,
      (options: PollOption[]) => {
        setPoll((prev) => (prev ? { ...prev, options } : null));
      }
    );

    return () => unsubscribe();
  }, [pollId]);

  return { poll, loading, error };
}
