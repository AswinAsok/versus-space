import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { authFacade, pollFacade } from '../../core/appServices';
import type { LeaderboardPoll } from '../../types';
import { HugeiconsIcon } from '@hugeicons/react';
import { Logout01Icon, Clock01Icon } from '@hugeicons/core-free-icons';
import { track } from '@vercel/analytics';
import styles from './Header.module.css';

interface HeaderProps {
  user: User | null;
  onNavigate: (path: string) => void;
  showBackedBy?: boolean;
}

export function Header({ user, onNavigate, showBackedBy = false }: HeaderProps) {
  const [recentPoll, setRecentPoll] = useState<LeaderboardPoll | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const fetchRecentPoll = async () => {
      try {
        const data = await pollFacade.getMostRecentPoll();
        setRecentPoll(data);
      } catch (err) {
        console.error('Failed to fetch recent poll:', err);
      }
    };

    fetchRecentPoll();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await authFacade.signOut();
    onNavigate('/');
  };

  return (
    <div className={`${styles.headerWrapper} ${isScrolled ? styles.scrolled : ''}`}>
      <header className={styles.appHeader}>
        <div className={styles.headerContent}>
          <nav className={styles.headerNav}>
            <div className={styles.navLeft}>
              <button onClick={() => onNavigate('/')} className={styles.logoButton}>
                <img src="/vs.png" alt="versus.space" className={styles.logoImage} />
              </button>
            </div>

            {/* Recent Poll or Backed By - Center */}
            {showBackedBy ? (
              <a
                href="https://ente.io/?utm_source=versus.space"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.backedByPill}
                onClick={() => track('ente_link_click', { location: 'header_backed_by' })}
              >
                <span className={styles.backedByText}>backed by</span>
                <img src="/ente-branding-green.png" alt="Ente" className={styles.backedByLogo} />
                <span className={styles.backedByAsterisk}>*</span>
              </a>
            ) : (
              recentPoll && (
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
                    onClick={() => onNavigate(`/poll/${recentPoll.slug}`)}
                    className={styles.trendingItem}
                  >
                    <HugeiconsIcon icon={Clock01Icon} size={14} />
                    <span className={styles.trendingTitle}>{recentPoll.title}</span>
                    <span className={styles.trendingVotes}>
                      {recentPoll.total_votes.toLocaleString()} votes
                    </span>
                  </button>
                </div>
              )
            )}

            <div className={styles.navRight}>
              {user ? (
                <div className={styles.userSection}>
                  <button
                    onClick={() => onNavigate('/dashboard')}
                    className={styles.userAvatar}
                    title="Go to Dashboard"
                  >
                    {user.email?.charAt(0).toUpperCase()}
                  </button>
                  <button onClick={handleSignOut} className={styles.signOutButton} title="Sign out">
                    <HugeiconsIcon icon={Logout01Icon} size={18} />
                  </button>
                </div>
              ) : (
                <button onClick={() => onNavigate('/create')} className={styles.createButton}>
                  Create Poll
                </button>
              )}
            </div>
          </nav>
        </div>
      </header>
    </div>
  );
}
