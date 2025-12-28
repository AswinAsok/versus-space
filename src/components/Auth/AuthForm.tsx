import { useState } from 'react';
import { authFacade } from '../../core/appServices';
import { AuthSEO } from '../SEO/SEO';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon, MailValidation01Icon } from '@hugeicons/core-free-icons';
import styles from './AuthForm.module.css';
import sharedStyles from '../../styles/Shared.module.css';

interface AuthFormProps {
  onSuccess: () => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await authFacade.signIn(email, password);
        onSuccess();
      } else {
        await authFacade.signUp(email, password);
        setShowVerificationModal(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      {/* SEO - noindex for auth pages */}
      <AuthSEO />

      {/* Centered Form */}
      <div className={styles.formPanel}>
        <div className={styles.formWrapper}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>{isLogin ? 'Welcome back' : 'Create your account'}</h2>
            <p className={styles.formSubtitle}>
              {isLogin
                ? 'Sign in to continue to your dashboard'
                : 'Start creating polls in under a minute'}
            </p>
          </div>

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

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={sharedStyles.errorMessage}>{error}</div>}

            <div className={styles.inputGroup}>
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="you@example.com"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="Enter your password"
                minLength={6}
              />
              {!isLogin && <span className={styles.inputHint}>Must be at least 6 characters</span>}
            </div>

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? (
                <span className={styles.loadingSpinner}></span>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                </>
              )}
            </button>
          </form>

          <div className={styles.formFooter}>
            <p>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className={styles.switchLink}
                disabled={loading}
              >
                {isLogin ? 'Sign up for free' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>

      {showVerificationModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalIcon}>
              <HugeiconsIcon icon={MailValidation01Icon} size={32} />
            </div>
            <h3 className={styles.modalTitle}>Confirm your email</h3>
            <p className={styles.modalText}>
              We sent a verification link to {email || 'your inbox'}. Please confirm your email to
              finish setting up your account.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalButton}
                onClick={() => {
                  setShowVerificationModal(false);
                  setIsLogin(true);
                }}
              >
                Back to sign in
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
