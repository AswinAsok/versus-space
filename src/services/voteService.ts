import { voteFacade } from '../core/appServices';

/**
 * Legacy alias maintained for consumers that still import voteService directly.
 */
export const voteService = voteFacade;
export type VoteService = typeof voteFacade;
