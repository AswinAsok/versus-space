import { User } from '@supabase/supabase-js';
import { authService } from '../../services/authService';
import { LogOut, Plus, LayoutDashboard, Zap } from 'lucide-react';
import styles from './Header.module.css';
import sharedStyles from '../../styles/Shared.module.css';

interface HeaderProps {
  user: User | null;
  onNavigate: (path: string) => void;
}

export function Header({ user, onNavigate }: HeaderProps) {
  const handleSignOut = async () => {
    await authService.signOut();
    onNavigate('/');
  };

  return (
    <header className={styles.appHeader}>
      <div className={styles.headerContent}>
        <button onClick={() => onNavigate('/')} className={styles.logoButton}>
          <div className={styles.logoIcon}>
            <Zap size={18} />
          </div>
          <span className={styles.logo}>versus.space</span>
        </button>

        <nav className={styles.headerNav}>
          {user ? (
            <>
              <button onClick={() => onNavigate('/dashboard')} className={styles.navLink}>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => onNavigate('/create')}
                className={`${sharedStyles.btnPrimary} ${styles.createButton}`}
              >
                <Plus size={18} />
                <span>Create Poll</span>
              </button>
              <div className={styles.userSection}>
                <div className={styles.userAvatar}>
                  {user.email?.charAt(0).toUpperCase()}
                </div>
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
        </nav>
      </div>
    </header>
  );
}
