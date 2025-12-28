import { User } from '@supabase/supabase-js';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Home04Icon,
  BarChartIcon,
  Add01Icon,
  ChartLineData01Icon,
  Settings01Icon,
  HelpCircleIcon,
  Logout01Icon,
  Cancel01Icon,
} from '@hugeicons/core-free-icons';
import styles from './Sidebar.module.css';

interface SidebarProps {
  user: User;
  currentPath: string;
  onNavigate: (path: string) => void;
  onSignOut: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const mainNavItems = [
  { icon: Home04Icon, label: 'Dashboard', path: '/dashboard' },
  { icon: BarChartIcon, label: 'My Polls', path: '/dashboard/polls' },
  { icon: Add01Icon, label: 'Create Poll', path: '/dashboard/create' },
  { icon: ChartLineData01Icon, label: 'Analytics', path: '/dashboard/analytics' },
];

const bottomNavItems = [
  { icon: Settings01Icon, label: 'Settings', path: '/dashboard/settings' },
  { icon: HelpCircleIcon, label: 'Help', path: 'https://github.com/AswinAsok/versus-space', external: true },
];

export function Sidebar({ user, currentPath, onNavigate, onSignOut, isOpen, onClose }: SidebarProps) {
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const userEmail = user.email || '';
  const userInitial = displayName.charAt(0).toUpperCase();

  const handleNavClick = (path: string, external?: boolean) => {
    if (external) {
      window.open(path, '_blank', 'noopener,noreferrer');
    } else {
      onNavigate(path);
      onClose();
    }
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return currentPath === '/dashboard';
    }
    return currentPath.startsWith(path);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        {/* Header */}
        <div className={styles.sidebarHeader}>
          <button onClick={() => handleNavClick('/')} className={styles.logoButton}>
            <img src="/vs.png" alt="versus.space" className={styles.logoImage} />
          </button>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close menu">
            <HugeiconsIcon icon={Cancel01Icon} size={20} />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className={styles.mainNav}>
          <ul className={styles.navList}>
            {mainNavItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => handleNavClick(item.path)}
                  className={`${styles.navItem} ${isActive(item.path) ? styles.navItemActive : ''}`}
                >
                  <span className={styles.navIcon}>
                    <HugeiconsIcon icon={item.icon} size={20} />
                  </span>
                  <span className={styles.navLabel}>{item.label}</span>
                  {isActive(item.path) && <span className={styles.activeIndicator} />}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Navigation */}
        <div className={styles.bottomSection}>
          <nav className={styles.bottomNav}>
            <ul className={styles.navList}>
              {bottomNavItems.map((item) => (
                <li key={item.path}>
                  <button
                    onClick={() => handleNavClick(item.path, item.external)}
                    className={`${styles.navItem} ${isActive(item.path) ? styles.navItemActive : ''}`}
                  >
                    <span className={styles.navIcon}>
                      <HugeiconsIcon icon={item.icon} size={20} />
                    </span>
                    <span className={styles.navLabel}>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Profile Section */}
          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>{userInitial}</div>
              <div className={styles.userDetails}>
                <span className={styles.userName}>{displayName}</span>
                <span className={styles.userEmail}>{userEmail}</span>
              </div>
            </div>
            <button onClick={onSignOut} className={styles.signOutButton} title="Sign out">
              <HugeiconsIcon icon={Logout01Icon} size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
