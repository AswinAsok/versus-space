import { pollFacade } from '../core/appServices';

/**
 * Legacy alias preserved for compatibility. Routes poll operations through the new facade.
 */
export const pollService = pollFacade;
export type PollService = typeof pollFacade;
