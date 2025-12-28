import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { authFacade } from '../../core/appServices';
import { Sidebar } from './Sidebar';
import { HugeiconsIcon } from '@hugeicons/react';
import { Menu01Icon } from '@hugeicons/core-free-icons';
import styles from './DashboardLayout.module.css';

interface DashboardLayoutProps {
  user: User;
}

export function DashboardLayout({ user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await authFacade.signOut();
    navigate('/');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className={styles.dashboardLayout}>
      <Sidebar
        user={user}
        currentPath={location.pathname}
        onNavigate={handleNavigate}
        onSignOut={handleSignOut}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <button
          className={styles.menuButton}
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <HugeiconsIcon icon={Menu01Icon} size={24} />
        </button>
        <img src="/vs.png" alt="versus.space" className={styles.mobileLogo} />
        <div className={styles.mobileAvatar}>
          {user.user_metadata?.full_name?.charAt(0).toUpperCase() ||
            user.email?.charAt(0).toUpperCase() ||
            'U'}
        </div>
      </div>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}
