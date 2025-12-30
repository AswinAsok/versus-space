import { useState, useEffect } from 'react';
import { usePollBySlug, useValidateAccessKey } from '../../hooks/usePollQueries';
import { supabase } from '../../lib/supabaseClient';
import { VotingInterface } from './VotingInterface';
import { PollSEO } from '../SEO/SEO';
import { MouseLoader } from '../Loading/MouseLoader';
import { Lock, Key, Code2, Eye, EyeOff } from 'lucide-react';
import styles from './PollView.module.css';
import sharedStyles from '../../styles/Shared.module.css';

interface PollViewProps {
  slug: string;
}

// Fetches poll data and renders the voting experience with sharing actions.
export function PollView({ slug }: PollViewProps) {
  const { data: poll, isLoading: loading, error } = usePollBySlug(slug);
  const [accessKey, setAccessKey] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [keyError, setKeyError] = useState('');
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const validateAccessKey = useValidateAccessKey();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track presence for analytics (show who's viewing this poll)
  useEffect(() => {
    if (!poll?.id) return;

    const channel = supabase.channel(`poll-presence:${poll.id}`, {
      config: { presence: { key: 'viewers' } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        // Presence sync - we just need to be subscribed
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track this viewer's presence
          await channel.track({
            viewerId: crypto.randomUUID(),
            joinedAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [poll?.id]);

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
      const storedKey = sessionStorage.getItem(`poll_key_${poll.id}`);
      if (storedKey) {
        try {
          const isValid = await validateAccessKey.mutateAsync({ pollId: poll.id, accessKey: storedKey });
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
  }, [poll, validateAccessKey]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeyError('');

    if (!accessKey.trim() || !poll) {
      setKeyError('Please enter the access key');
      return;
    }

    try {
      const isValid = await validateAccessKey.mutateAsync({ pollId: poll.id, accessKey });
      if (isValid) {
        sessionStorage.setItem(`poll_key_${poll.id}`, accessKey);
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
    return <MouseLoader message="Loading poll..." />;
  }

  if (error || !poll) {
    return <div className={sharedStyles.errorContainer}>Poll not found</div>;
  }

  // Show message for deactivated polls
  const isExpired = poll.ends_at ? new Date(poll.ends_at) <= new Date() : false;

  if (!poll.is_active && !isExpired) {
    return (
      <div className={styles.pollViewContainer}>
        <div className={styles.closedPollView}>
          <div className={styles.closedPollContent}>
            <span className={styles.closedBadge}>Poll Closed</span>
            <h1 className={styles.closedTitle}>{poll.title}</h1>
            <p className={styles.closedDescription}>
              This poll is no longer accepting votes.
            </p>
            <div className={styles.closedDivider} />
            <p className={styles.closedCta}>
              Or create your own poll
            </p>
            <a href="/dashboard/create" className={styles.createPollButton}>
              Create Poll
            </a>
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

  // Calculate total votes for SEO
  const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.vote_count || 0), 0);

  return (
    <div className={styles.pollViewContainer}>
      {/* Dynamic SEO for individual poll pages */}
      <PollSEO
        slug={poll.slug}
        pollTitle={poll.title}
        totalVotes={totalVotes}
        optionCount={poll.options.length}
        createdAt={poll.created_at}
      />
      <VotingInterface
        pollId={poll.id}
        slug={poll.slug}
        title={poll.title}
        options={poll.options}
        isExpired={isExpired || !poll.is_active}
        maxVotesPerIp={poll.max_votes_per_ip}
        endsAt={poll.ends_at}
      />
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
