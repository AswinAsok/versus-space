import { useState, useEffect } from 'react';
import { usePoll } from '../../hooks/usePoll';
import { pollService } from '../../services/pollService';
import { VotingInterface } from './VotingInterface';
import { Lock, Key, Code2, Eye, EyeOff, XCircle } from 'lucide-react';
import styles from './PollView.module.css';
import sharedStyles from '../../styles/Shared.module.css';

interface PollViewProps {
  pollId: string;
}

// Fetches poll data and renders the voting experience with sharing actions.
export function PollView({ pollId }: PollViewProps) {
  const { poll, loading, error } = usePoll(pollId);
  const [accessKey, setAccessKey] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [keyError, setKeyError] = useState('');
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkAccess = async () => {
      if (!poll) return;

      // If public, automatically unlock
      if (poll.is_public) {
        setIsUnlocked(true);
        setCheckingAccess(false);
        return;
      }

      // Check if we have a stored key for this poll
      const storedKey = sessionStorage.getItem(`poll_key_${pollId}`);
      if (storedKey) {
        try {
          const isValid = await pollService.validateAccessKey(pollId, storedKey);
          if (isValid) {
            setIsUnlocked(true);
          }
        } catch (err) {
          console.error('Error validating stored key:', err);
        }
      }
      setCheckingAccess(false);
    };

    checkAccess();
  }, [poll, pollId]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeyError('');

    if (!accessKey.trim()) {
      setKeyError('Please enter the access key');
      return;
    }

    try {
      const isValid = await pollService.validateAccessKey(pollId, accessKey);
      if (isValid) {
        sessionStorage.setItem(`poll_key_${pollId}`, accessKey);
        setIsUnlocked(true);
      } else {
        setKeyError('Invalid access key');
      }
    } catch (err) {
      console.log(err);
      setKeyError('Failed to validate key');
    }
  };

  if (loading || checkingAccess) {
    return <div className={sharedStyles.loading}>Loading poll...</div>;
  }

  if (error || !poll) {
    return <div className={sharedStyles.errorContainer}>Poll not found</div>;
  }

  // Show message for deactivated polls
  if (!poll.is_active) {
    return (
      <div className={styles.pollViewContainer}>
        <div className={styles.pollViewInner}>
          <div className={styles.accessKeyCard}>
            <div className={styles.accessKeyContainer}>
              <div className={styles.lockIconWrapper}>
                <div className={styles.lockIconOuter}>
                  <div className={styles.lockIconInner}>
                    <XCircle size={40} />
                  </div>
                </div>
              </div>
              <h2 className={styles.accessKeyTitle}>Poll Closed</h2>
              <p className={styles.accessKeyDescription}>
                This poll is no longer active. The creator has closed voting.
              </p>
            </div>
          </div>

          <div className={`${styles.footerWrapper} ${isScrolled ? styles.scrolled : ''}`}>
            <footer className={styles.footer}>
              <span>&copy; 2025 versus.space</span>
              <div className={styles.footerRight}>
                <a
                  href="https://neal.fun"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.footerLink}
                >
                  inspired from neal<span className={styles.footerDot}>.</span>fun
                </a>
                <span className={styles.footerDivider}>·</span>
                <a
                  href="https://github.com/AswinAsok"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.footerLink}
                >
                  <Code2 size={14} />
                  built by aswinasok<span className={styles.footerDot}>.</span>
                </a>
              </div>
            </footer>
          </div>
        </div>
      </div>
    );
  }

  // Show access key form for private polls that haven't been unlocked
  if (!poll.is_public && !isUnlocked) {
    return (
      <div className={styles.pollViewContainer}>
        <div className={styles.pollViewInner}>
          <div className={styles.accessKeyCard}>
            <div className={styles.accessKeyContainer}>
              <div className={styles.lockIconWrapper}>
                <div className={styles.lockIconOuter}>
                  <div className={styles.lockIconInner}>
                    <Lock size={40} />
                  </div>
                  <div className={styles.lockOrbit}>
                    <div className={styles.orbitDot}></div>
                  </div>
                </div>
              </div>
              <h2 className={styles.accessKeyTitle}>Private Poll</h2>
              <p className={styles.accessKeyDescription}>
                This poll is private. Enter the access key to participate.
              </p>
              <form onSubmit={handleUnlock} className={styles.accessKeyForm}>
                <div className={styles.accessKeyInputWrapper}>
                  <Key size={18} className={styles.keyIcon} />
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={accessKey}
                    onChange={(e) => {
                      setAccessKey(e.target.value);
                      if (keyError) setKeyError('');
                    }}
                    placeholder="Enter access key"
                    className={`${styles.accessKeyInput} ${keyError ? styles.inputError : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className={styles.eyeButton}
                    aria-label={showKey ? 'Hide access key' : 'Show access key'}
                  >
                    {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {keyError && <span className={styles.keyErrorText}>{keyError}</span>}
                <button
                  type="submit"
                  className={`${sharedStyles.btnPrimary} ${sharedStyles.btnLarge} ${styles.unlockButton}`}
                >
                  Unlock Poll
                </button>
              </form>
            </div>
          </div>

          <div className={`${styles.footerWrapper} ${isScrolled ? styles.scrolled : ''}`}>
            <footer className={styles.footer}>
              <span>&copy; 2025 versus.space</span>
              <div className={styles.footerRight}>
                <a
                  href="https://neal.fun"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.footerLink}
                >
                  inspired from neal<span className={styles.footerDot}>.</span>fun
                </a>
                <span className={styles.footerDivider}>·</span>
                <a
                  href="https://github.com/AswinAsok"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.footerLink}
                >
                  <Code2 size={14} />
                  built by aswinasok<span className={styles.footerDot}>.</span>
                </a>
              </div>
            </footer>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pollViewContainer}>
      <VotingInterface pollId={poll.id} title={poll.title} options={poll.options} />
      <div className={`${styles.footerWrapper} ${isScrolled ? styles.scrolled : ''}`}>
        <footer className={styles.footer}>
          <span>&copy; 2025 versus.space</span>
          <div className={styles.footerRight}>
            <a
              href="https://neal.fun"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
            >
              inspired from neal<span className={styles.footerDot}>.</span>fun
            </a>
            <span className={styles.footerDivider}>·</span>
            <a
              href="https://github.com/AswinAsok"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
            >
              <Code2 size={14} />
              built by aswinasok<span className={styles.footerDot}>.</span>
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
