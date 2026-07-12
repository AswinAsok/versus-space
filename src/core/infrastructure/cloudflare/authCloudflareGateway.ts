import { authClient } from '../../../lib/authClient';

function throwIfError(result: { error?: { message?: string } | null }) {
  if (result.error) throw new Error(result.error.message || 'Authentication failed');
}

export const authFacade = {
  async signUp(email: string, password: string) {
    const result = await authClient.signUp.email({
      email,
      password,
      name: email.split('@')[0] || email,
      callbackURL: `${window.location.origin}/auth`,
    });
    throwIfError(result);
  },

  async signIn(email: string, password: string) {
    const result = await authClient.signIn.email({ email, password });
    throwIfError(result);
  },

  async signOut() {
    const result = await authClient.signOut();
    throwIfError(result);
  },

  async requestPasswordReset(email: string) {
    const result = await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/auth`,
    });
    throwIfError(result);
  },

  async resetPassword(password: string, token: string) {
    const result = await authClient.resetPassword({ newPassword: password, token });
    throwIfError(result);
  },
};
