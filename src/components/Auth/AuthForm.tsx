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
  const searchParams = new URLSearchParams(window.location.search);
  const resetToken = searchParams.get('token');
  const callbackError = searchParams.get('error');
  const [isLogin, setIsLogin] = useState(true);
  const [passwordMode, setPasswordMode] = useState<'auth' | 'forgot' | 'reset'>(
    resetToken ? 'reset' : callbackError ? 'forgot' : 'auth'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(
    callbackError ? 'This authentication link is invalid or expired. Request a new one.' : ''
  );
  const [loading, setLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (passwordMode === 'forgot') {
        await authFacade.requestPasswordReset(email);
        setShowVerificationModal(true);
      } else if (passwordMode === 'reset' && resetToken) {
        await authFacade.resetPassword(password, resetToken);
        window.history.replaceState({}, '', '/auth');
        setPasswordMode('auth');
        setIsLogin(true);
        setError('Password updated. You can now sign in.');
      } else if (isLogin) {
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
                {passwordMode === 'forgot'
                  ? 'Reset your password'
                  : passwordMode === 'reset'
                    ? 'Choose a new password'
                    : isLogin
                      ? 'Welcome back'
                      : 'Create your account'}
              </h2>
              <p className={styles.formSubtitle}>
                {passwordMode === 'forgot'
                  ? 'We will email you a secure reset link'
                  : passwordMode === 'reset'
                    ? 'Enter a new password for your account'
                    : isLogin
                      ? 'Sign in to continue to your dashboard'
                      : 'Start creating polls in under a minute'}
              </p>
            </div>

            {passwordMode === 'auth' && (
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
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              {passwordMode !== 'reset' && (
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
              )}

              {passwordMode !== 'forgot' && (
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
                      minLength={8}
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
                    Must be at least 8 characters
                  </span>
                </div>
              )}

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
                    {passwordMode === 'forgot'
                      ? 'Send reset link'
                      : passwordMode === 'reset'
                        ? 'Update password'
                        : isLogin
                          ? 'Sign In'
                          : 'Create Account'}
                    <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                  </>
                )}
              </button>
            </form>

            {passwordMode === 'auth' && isLogin && (
              <div className={styles.formFooter}>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setPasswordMode('forgot');
                  }}
                  className={styles.switchLink}
                  disabled={loading}
                >
                  Forgot your password?
                </button>
              </div>
            )}

            <div className={styles.formFooter}>
              <p>
                {passwordMode !== 'auth'
                  ? 'Remembered your password? '
                  : isLogin
                    ? "Don't have an account? "
                    : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    if (passwordMode !== 'auth') {
                      setPasswordMode('auth');
                      setIsLogin(true);
                    } else {
                      setIsLogin(!isLogin);
                    }
                  }}
                  className={styles.switchLink}
                  disabled={loading}
                >
                  {passwordMode !== 'auth' ? 'Sign in' : isLogin ? 'Sign up for free' : 'Sign in'}
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
              <h3 className={styles.modalTitle}>
                {passwordMode === 'forgot' ? 'Check your email' : 'Confirm your email'}
              </h3>
              <p className={styles.modalText}>
                {passwordMode === 'forgot'
                  ? `If an account exists for ${email || 'that address'}, we sent a password reset link.`
                  : `We sent a verification link to ${email || 'your inbox'}. Please confirm your email to finish setting up your account.`}
              </p>
            </div>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalButton}
                onClick={() => {
                  setShowVerificationModal(false);
                  setPasswordMode('auth');
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
