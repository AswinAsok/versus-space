import { authFacade } from '../core/appServices';

/**
 * Legacy alias preserved for compatibility. All auth flows now run through the layered facade.
 */
export const authService = authFacade;
export type AuthService = typeof authFacade;
