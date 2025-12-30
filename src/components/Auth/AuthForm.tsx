import { useState } from 'react';
import { authFacade } from '../../core/appServices';
import { AuthSEO } from '../SEO/SEO';
import { Footer } from '../Layout/Footer';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight01Icon,
  MailValidation01Icon,
  ViewIcon,
  ViewOffIcon,
  Tick01Icon,
  ChartLineData01Icon,
  Share01Icon,
  FlashIcon,
  Cancel01Icon,
} from '@hugeicons/core-free-icons';
import styles from './AuthForm.module.css';

interface AuthFormProps {
  onSuccess: () => void;
}

const features = [
  {
    icon: ChartLineData01Icon,
    title: 'Real-time Analytics',
    description: 'Watch votes come in live with instant updates and visualizations',
  },
  {
    icon: Share01Icon,
    title: 'Easy Sharing',
    description: 'Share polls instantly via link, social media, or embed on your site',
  },
  {
    icon: FlashIcon,
    title: 'Lightning Fast',
    description: 'Create polls in seconds and get results immediately',
  },
];

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await authFacade.signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      {/* SEO - noindex for auth pages */}
      <AuthSEO />

      <div className={styles.authContainer}>
        {/* Left Panel - Branding & Features */}
        <div className={styles.brandPanel}>
          <div className={styles.brandContent}>
            <div className={styles.brandHeader}>
              <h1 className={styles.brandTitle}>versus.space</h1>
            </div>
            <p className={styles.brandTagline}>
              Create engaging polls and get instant feedback from your audience
            </p>

            <div className={styles.featuresList}>
              {features.map((feature, index) => (
                <div key={index} className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <HugeiconsIcon icon={feature.icon} size={16} />
                  </div>
                  <div className={styles.featureText}>
                    <h3 className={styles.featureTitle}>{feature.title}</h3>
                    <p className={styles.featureDescription}>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.trustBadges}>
              <div className={styles.trustItem}>
                <HugeiconsIcon icon={Tick01Icon} size={14} />
                <span>Free to get started</span>
              </div>
              <div className={styles.trustItem}>
                <HugeiconsIcon icon={Tick01Icon} size={14} />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className={styles.formPanel}>
          <div className={styles.formWrapper}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>
                {isLogin ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className={styles.formSubtitle}>
                {isLogin
                  ? 'Sign in to continue to your dashboard'
                  : 'Start creating polls in under a minute'}
              </p>
            </div>

            <div className={styles.toggleContainer}>
              <div className={`${styles.togglePill} ${!isLogin ? styles.togglePillRight : ''}`} />
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

            <button
              type="button"
              className={styles.googleButton}
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className={styles.googleIcon} viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            <div className={styles.divider}>
              <span>or</span>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
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
                <div className={styles.passwordWrapper}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Enter your password"
                    minLength={6}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <HugeiconsIcon icon={showPassword ? ViewOffIcon : ViewIcon} size={16} />
                  </button>
                </div>
                <span className={`${styles.inputHint} ${isLogin ? styles.inputHintHidden : ''}`}>
                  Must be at least 6 characters
                </span>
              </div>

              {error && (
                <div className={styles.errorMessage}>
                  <span className={styles.errorIcon}>!</span>
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? (
                  <span className={styles.loadingSpinner}></span>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
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
      </div>

      {showVerificationModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <span className={styles.modalHeaderTitle}>Email Verification</span>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => {
                  setShowVerificationModal(false);
                  setIsLogin(true);
                }}
                aria-label="Close modal"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalIcon}>
                <HugeiconsIcon icon={MailValidation01Icon} size={20} />
              </div>
              <h3 className={styles.modalTitle}>Confirm your email</h3>
              <p className={styles.modalText}>
                We sent a verification link to {email || 'your inbox'}. Please confirm your email to
                finish setting up your account.
              </p>
            </div>
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

      <Footer variant="minimal" />
    </div>
  );
}
