import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { pollFacade } from '../core/appServices';
import type { CreatePollData, UpdatePollData, Poll, PollWithOptions } from '../types';

// Query keys for cache management
export const pollKeys = {
  all: ['polls'] as const,
  lists: () => [...pollKeys.all, 'list'] as const,
  list: (userId: string) => [...pollKeys.lists(), userId] as const,
  count: (userId: string) => [...pollKeys.all, 'count', userId] as const,
  details: () => [...pollKeys.all, 'detail'] as const,
  detail: (id: string) => [...pollKeys.details(), id] as const,
  bySlug: (slug: string) => [...pollKeys.all, 'slug', slug] as const,
  leaderboard: (limit?: number) => [...pollKeys.all, 'leaderboard', limit] as const,
  platformStats: () => [...pollKeys.all, 'platformStats'] as const,
  mostRecent: () => [...pollKeys.all, 'mostRecent'] as const,
  proUserCount: () => [...pollKeys.all, 'proUserCount'] as const,
};

/**
 * Fetch user's polls with caching
 */
export function useUserPolls(userId: string | undefined) {
  return useQuery({
    queryKey: pollKeys.list(userId ?? ''),
    queryFn: () => pollFacade.getUserPolls(userId!),
    enabled: !!userId,
  });
}

/**
 * Fetch count of user's polls with caching
 */
export function useUserPollCount(userId: string | undefined) {
  return useQuery({
    queryKey: pollKeys.count(userId ?? ''),
    queryFn: () => pollFacade.getUserPollCount(userId!),
    enabled: !!userId,
  });
}

/**
 * Fetch a single poll by ID with caching
 */
export function usePollById(pollId: string | undefined) {
  return useQuery({
    queryKey: pollKeys.detail(pollId ?? ''),
    queryFn: () => pollFacade.getPoll(pollId!),
    enabled: !!pollId,
  });
}

/**
 * Fetch a poll by slug with caching and real-time subscription
 */
export function usePollBySlug(slug: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: pollKeys.bySlug(slug ?? ''),
    queryFn: () => pollFacade.getPollBySlug(slug!),
    enabled: !!slug,
  });

  // Subscribe to real-time updates once we have the poll
  useEffect(() => {
    if (!query.data?.id) return;

    const unsubscribe = pollFacade.subscribeToPollOptions(query.data.id, (update) => {
      queryClient.setQueryData<PollWithOptions | null>(pollKeys.bySlug(slug!), (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          options: update(prev.options),
        };
      });
    });

    return () => unsubscribe();
  }, [query.data?.id, slug, queryClient]);

  return query;
}

/**
 * Fetch leaderboard polls with caching
 */
export function useLeaderboard(limit?: number) {
  return useQuery({
    queryKey: pollKeys.leaderboard(limit),
    queryFn: () => pollFacade.getLeaderboard(limit),
  });
}

/**
 * Fetch most recent poll with caching
 */
export function useMostRecentPoll() {
  return useQuery({
    queryKey: pollKeys.mostRecent(),
    queryFn: () => pollFacade.getMostRecentPoll(),
  });
}

/**
 * Fetch platform stats with caching and real-time subscription
 */
export function usePlatformStats() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: pollKeys.platformStats(),
    queryFn: () => pollFacade.getPlatformStats(),
  });

  // Subscribe to real-time stats updates
  useEffect(() => {
    if (!query.data) return;

    const unsubscribe = pollFacade.subscribeToPlatformStats(
      (update) => {
        queryClient.setQueryData(pollKeys.platformStats(), (prev) => {
          if (!prev) return prev;
          return update(prev);
        });
      },
      () => {
        // On new vote, invalidate leaderboard to refresh counts
        queryClient.invalidateQueries({ queryKey: pollKeys.leaderboard() });
      }
    );

    return () => unsubscribe();
  }, [query.data, queryClient]);

  return query;
}

/**
 * Create a new poll mutation
 */
export function useCreatePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, userId }: { data: CreatePollData; userId: string }) =>
      pollFacade.createPoll(data, userId),
    onSuccess: (newPoll, { userId }) => {
      // Invalidate user polls list to include the new poll
      queryClient.invalidateQueries({ queryKey: pollKeys.list(userId) });
      // Invalidate leaderboard if public
      if (newPoll.is_public) {
        queryClient.invalidateQueries({ queryKey: pollKeys.leaderboard() });
      }
      // Invalidate platform stats
      queryClient.invalidateQueries({ queryKey: pollKeys.platformStats() });
    },
  });
}

/**
 * Update an existing poll mutation
 */
export function useUpdatePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pollId, data }: { pollId: string; data: UpdatePollData }) =>
      pollFacade.updatePoll(pollId, data),
    onSuccess: (updatedPoll) => {
      // Update the cached poll data
      queryClient.setQueryData(pollKeys.detail(updatedPoll.id), updatedPoll);
      queryClient.setQueryData(pollKeys.bySlug(updatedPoll.slug), updatedPoll);
      // Invalidate lists that might contain this poll
      queryClient.invalidateQueries({ queryKey: pollKeys.lists() });
      queryClient.invalidateQueries({ queryKey: pollKeys.leaderboard() });
    },
  });
}

/**
 * Delete a poll mutation
 */
export function useDeletePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pollId: string) => pollFacade.deletePoll(pollId),
    onSuccess: (_, pollId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: pollKeys.detail(pollId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: pollKeys.lists() });
      queryClient.invalidateQueries({ queryKey: pollKeys.leaderboard() });
      queryClient.invalidateQueries({ queryKey: pollKeys.platformStats() });
    },
  });
}

/**
 * Toggle poll active status mutation
 */
export function useTogglePollStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pollId, isActive }: { pollId: string; isActive: boolean }) =>
      pollFacade.updatePollStatus(pollId, isActive),
    onMutate: async ({ pollId, isActive }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: pollKeys.lists() });

      // Snapshot the previous value for rollback
      const previousPolls = queryClient.getQueriesData({ queryKey: pollKeys.lists() });

      // Optimistically update the cache
      queryClient.setQueriesData<PollWithOptions[]>({ queryKey: pollKeys.lists() }, (old) => {
        if (!old) return old;
        return old.map((p) => (p.id === pollId ? { ...p, is_active: isActive } : p));
      });

      return { previousPolls };
    },
    onError: (_, __, context) => {
      // Rollback on error
      if (context?.previousPolls) {
        context.previousPolls.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: pollKeys.lists() });
    },
  });
}

/**
 * Validate poll access key
 */
export function useValidateAccessKey() {
  return useMutation({
    mutationFn: ({ pollId, accessKey }: { pollId: string; accessKey: string }) =>
      pollFacade.validateAccessKey(pollId, accessKey),
  });
}

/**
 * Check if poll is public
 */
export function usePollPublicStatus(pollId: string | undefined) {
  return useQuery({
    queryKey: [...pollKeys.detail(pollId ?? ''), 'public'],
    queryFn: () => pollFacade.isPollPublic(pollId!),
    enabled: !!pollId,
  });
}

/**
 * Fetch pro user count with caching
 */
export function useProUserCount() {
  return useQuery({
    queryKey: pollKeys.proUserCount(),
    queryFn: () => pollFacade.getProUserCount(),
  });
}
