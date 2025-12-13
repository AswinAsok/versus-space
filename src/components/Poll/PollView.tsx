import { useState, useEffect } from 'react';
import { usePoll } from '../../hooks/usePoll';
import { pollService } from '../../services/pollService';
import { VotingInterface } from './VotingInterface';
import { Lock, Key, Code2 } from 'lucide-react';
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

  // Show access key form for private polls that haven't been unlocked
  if (!poll.is_public && !isUnlocked) {
    return (
      <div className={styles.pollViewContainer}>
        <div className={styles.accessKeyContainer}>
          <div className={styles.lockIcon}>
            <Lock size={48} />
          </div>
          <h2 className={styles.accessKeyTitle}>Private Poll</h2>
          <p className={styles.accessKeyDescription}>
            This poll is private. Enter the access key to participate.
          </p>
          <form onSubmit={handleUnlock} className={styles.accessKeyForm}>
            {keyError && <div className={sharedStyles.errorMessage}>{keyError}</div>}
            <div className={styles.accessKeyInputWrapper}>
              <Key size={18} className={styles.keyIcon} />
              <input
                type="text"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="Enter access key"
                className={styles.accessKeyInput}
              />
            </div>
            <button type="submit" className={`${sharedStyles.btnPrimary} ${sharedStyles.btnLarge}`}>
              Unlock Poll
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pollViewContainer}>
      <VotingInterface pollId={poll.id} options={poll.options} />
      <footer className={styles.footer}>
        <span>&copy; 2025 versus.space</span>
        <div className={styles.footerRight}>
          <a
            href="https://neal.fun"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            inspiration from neal<span className={styles.footerDot}>.</span>fun
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
  );
}
