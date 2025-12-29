import { useState, useEffect } from 'react';
import { pollFacade } from '../core/appServices';
import type { PollWithOptions } from '../types';

interface UsePollOptions {
  slug?: string;
  pollId?: string;
}

/**
 * Retrieves a poll, keeps it updated via realtime subscription, and exposes status flags.
 * This hook isolates data-fetching concerns from the rendering layer.
 * Supports fetching by slug (for URL-friendly links) or by pollId.
 */
export function usePoll(options: UsePollOptions | string | undefined) {
  const [poll, setPoll] = useState<PollWithOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Support both old string-based API and new options object
  const slug = typeof options === 'object' ? options?.slug : undefined;
  const pollId = typeof options === 'object' ? options?.pollId : options;

  useEffect(() => {
    if (!slug && !pollId) {
      setLoading(false);
      return;
    }

    const fetchPoll = async () => {
      try {
        let data: PollWithOptions | null = null;
        if (slug) {
          data = await pollFacade.getPollBySlug(slug);
        } else if (pollId) {
          data = await pollFacade.getPoll(pollId);
        }
        setPoll(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load poll');
        setLoading(false);
      }
    };

    fetchPoll();
  }, [slug, pollId]);

  // Subscribe to real-time updates once we have the poll
  useEffect(() => {
    if (!poll?.id) return;

    const unsubscribe = pollFacade.subscribeToPollOptions(poll.id, (update) => {
      setPoll((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          options: update(prev.options),
        };
      });
    });

    return () => unsubscribe();
  }, [poll?.id]);

  return { poll, loading, error };
}
