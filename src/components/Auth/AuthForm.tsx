import { useState } from 'react';
import { authService } from '../../services/authService';
import { Zap, BarChart3, Users, Lock, Check, ArrowRight } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
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

  const features = [
    { icon: Zap, text: 'Real-time voting updates' },
    { icon: BarChart3, text: 'Beautiful split-screen visualizations' },
    { icon: Users, text: 'Unlimited participants' },
    { icon: Lock, text: 'Public & private poll options' },
  ];

  return (
    <div className={styles.authPage}>
      {/* Left Panel - Marketing */}
      <div className={styles.marketingPanel}>
        <div className={styles.marketingContent}>
          <h1 className={styles.marketingTitle}>
            Create engaging polls in seconds
          </h1>
          <p className={styles.marketingSubtitle}>
            Join thousands of teams using versus.space to make better decisions with real-time voting.
          </p>

          <div className={styles.featuresList}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <feature.icon size={20} />
                </div>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>

          <div className={styles.testimonial}>
            <p className={styles.testimonialText}>
              "versus.space transformed how we make team decisions. The real-time updates make it feel magical."
            </p>
            <div className={styles.testimonialAuthor}>
              <div className={styles.testimonialAvatar}>SK</div>
              <div>
                <div className={styles.testimonialName}>Sarah Kim</div>
                <div className={styles.testimonialRole}>Product Lead at TechCorp</div>
              </div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className={styles.bgDecoration}>
          <div className={styles.bgCircle1}></div>
          <div className={styles.bgCircle2}></div>
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
              {!isLogin && (
                <span className={styles.inputHint}>Must be at least 6 characters</span>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <span className={styles.loadingSpinner}></span>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className={styles.formFooter}>
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
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

          {!isLogin && (
            <div className={styles.benefits}>
              <div className={styles.benefitItem}>
                <Check size={16} />
                <span>Free forever for basic use</span>
              </div>
              <div className={styles.benefitItem}>
                <Check size={16} />
                <span>No credit card required</span>
              </div>
              <div className={styles.benefitItem}>
                <Check size={16} />
                <span>Setup in 30 seconds</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
