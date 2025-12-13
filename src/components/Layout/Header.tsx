import { User } from '@supabase/supabase-js';
import { authService } from '../../services/authService';
import { LogOut, Plus } from 'lucide-react';

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
    <header className="app-header">
      <div className="header-content">
        <button onClick={() => onNavigate('/')} className="logo-button">
          <h1 className="logo">versus.space</h1>
        </button>

        <nav className="header-nav">
          {user ? (
            <>
              <button onClick={() => onNavigate('/dashboard')} className="nav-link">
                Dashboard
              </button>
              <button onClick={() => onNavigate('/create')} className="btn-primary">
                <Plus size={18} />
                Create Poll
              </button>
              <button onClick={handleSignOut} className="btn-icon" title="Sign out">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <button onClick={() => onNavigate('/auth')} className="btn-primary">
              Sign In
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
