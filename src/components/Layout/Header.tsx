import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { authService } from '../../services/authService';
import { pollService } from '../../services/pollService';
import type { LeaderboardPoll } from '../../types';
import { LogOut, Plus, TrendingUp } from 'lucide-react';
import styles from './Header.module.css';
import sharedStyles from '../../styles/Shared.module.css';

const TRENDING_POLL_ID = '70427c7e-9405-4b76-b062-087790c6f5ef';

interface HeaderProps {
  user: User | null;
  onNavigate: (path: string) => void;
}

export function Header({ user, onNavigate }: HeaderProps) {
  const [polls, setPolls] = useState<LeaderboardPoll[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const data = await pollService.getLeaderboard(5);
        // Prioritize the trending poll to be first
        const sortedData = [...data].sort((a, b) => {
          if (a.id === TRENDING_POLL_ID) return -1;
          if (b.id === TRENDING_POLL_ID) return 1;
          return 0;
        });
        setPolls(sortedData);
      } catch (err) {
        console.error('Failed to fetch polls:', err);
      }
    };

    fetchPolls();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await authService.signOut();
    onNavigate('/');
  };

  return (
    <div className={`${styles.headerWrapper} ${isScrolled ? styles.scrolled : ''}`}>
      <header className={styles.appHeader}>
        <div className={styles.headerContent}>
          <nav className={styles.headerNav}>
            <div className={styles.navLeft}>
              <button onClick={() => onNavigate('/')} className={styles.logoButton}>
                <span className={styles.logo}>
                  <span className={styles.logoHighlight}>v</span>ersu
                  <span className={styles.logoHighlight}>s</span>
                  <span className={styles.logoDot}>.</span>space
                </span>
              </button>
            </div>

            {/* Trending Poll - Center */}
            {polls.length > 0 && (
              <div className={styles.trendingWrapper}>
                <span className={styles.sparkle} style={{ top: '-4px', left: '10%' }}></span>
                <span
                  className={styles.sparkle}
                  style={{ top: '50%', right: '-6px', animationDelay: '2s' }}
                ></span>
                <span
                  className={styles.sparkle}
                  style={{ bottom: '-4px', left: '40%', animationDelay: '4s' }}
                ></span>
                <button
                  onClick={() => onNavigate(`/poll/${polls[0].id}`)}
                  className={styles.trendingItem}
                >
                  <TrendingUp size={14} />
                  <span className={styles.trendingTitle}>{polls[0].title}</span>
                  <span className={styles.trendingVotes}>
                    {polls[0].total_votes.toLocaleString()} votes
                  </span>
                </button>
              </div>
            )}

            <div className={styles.navRight}>
              {user ? (
                <>
                  <button
                    onClick={() => onNavigate('/create')}
                    className={`${sharedStyles.btnPrimary} ${styles.createButton}`}
                  >
                    <Plus size={18} />
                    <span>Create Poll</span>
                  </button>
                  <div className={styles.userSection}>
                    <div className={styles.userAvatar}>{user.email?.charAt(0).toUpperCase()}</div>
                    <button
                      onClick={handleSignOut}
                      className={styles.signOutButton}
                      title="Sign out"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button onClick={() => onNavigate('/auth')} className={styles.navLink}>
                    Sign In
                  </button>
                  <button
                    onClick={() => onNavigate('/auth')}
                    className={`${sharedStyles.btnPrimary} ${styles.createButton}`}
                  >
                    Get Started Free
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>
    </div>
  );
}
