import { useState } from 'react';
import { authService } from '../../services/authService';
import styles from './AuthForm.module.css';
import sharedStyles from '../../styles/Shared.module.css';

interface AuthFormProps {
  onSuccess: () => void;
}

// Handles both sign-up and sign-in flows while isolating auth side-effects.
export function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Dispatch to the correct auth pathway based on the current mode.
      if (isLogin) {
        await authService.signIn(email, password);
      } else {
        await authService.signUp(email, password);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>{isLogin ? 'Sign In' : 'Sign Up'}</h2>

        {error && <div className={sharedStyles.errorMessage}>{error}</div>}

        <div className={sharedStyles.formGroup}>
          <label htmlFor="email">Email</label>
          {/* Capture the user's email; browser validation covers format */}
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            placeholder="your@email.com"
          />
        </div>

        <div className={sharedStyles.formGroup}>
          <label htmlFor="password">Password</label>
          {/* Basic length requirement to align with Supabase defaults */}
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            placeholder="••••••••"
            minLength={6}
          />
        </div>

        <button type="submit" className={sharedStyles.btnPrimary} disabled={loading}>
          {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
        </button>

        <button
          type="button"
          className={sharedStyles.btnLink}
          onClick={() => setIsLogin(!isLogin)}
          disabled={loading}
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  );
}
