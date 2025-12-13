import { User } from '@supabase/supabase-js';
import { authService } from '../../services/authService';
import { LogOut, Plus } from 'lucide-react';
import headerStyles from './Header.module.css';
import sharedStyles from '../../styles/Shared.module.css';

interface HeaderProps {
  user: User | null;
  onNavigate: (path: string) => void;
}

// Top-level navigation bar that adapts to auth state.
export function Header({ user, onNavigate }: HeaderProps) {
  const handleSignOut = async () => {
    // Ensure the session is cleared before redirecting.
    await authService.signOut();
    onNavigate('/');
  };

  return (
    <header className={headerStyles.appHeader}>
      <div className={headerStyles.headerContent}>
        <button onClick={() => onNavigate('/')} className={headerStyles.logoButton}>
          <h1 className={headerStyles.logo}>versus.space</h1>
        </button>

        <nav className={headerStyles.headerNav}>
          {user ? (
            <>
              <button onClick={() => onNavigate('/dashboard')} className={headerStyles.navLink}>
                Dashboard
              </button>
              <button
                onClick={() => onNavigate('/create')}
                className={sharedStyles.btnPrimary}
              >
                <Plus size={18} />
                Create Poll
              </button>
              <button
                onClick={handleSignOut}
                className={sharedStyles.btnIcon}
                title="Sign out"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <button onClick={() => onNavigate('/auth')} className={sharedStyles.btnPrimary}>
              Sign In
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
