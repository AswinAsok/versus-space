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
        <h2 className={styles.title}>Welcome</h2>
        <p className={styles.subtitle}>
          {isLogin ? 'Sign in to continue' : 'Create your account'}
        </p>

        <div className={styles.toggleContainer}>
          <button
            type="button"
            className={`${styles.toggleButton} ${isLogin ? styles.toggleActive : ''}`}
            onClick={() => setIsLogin(true)}
            disabled={loading}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`${styles.toggleButton} ${!isLogin ? styles.toggleActive : ''}`}
            onClick={() => setIsLogin(false)}
            disabled={loading}
          >
            Sign Up
          </button>
        </div>

        {error && <div className={sharedStyles.errorMessage}>{error}</div>}

        <div className={sharedStyles.formGroup}>
          <label htmlFor="email">Email</label>
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

        <button
          type="submit"
          className={`${sharedStyles.btnPrimary} ${sharedStyles.btnLarge}`}
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}
