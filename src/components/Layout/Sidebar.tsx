import { User } from '@supabase/supabase-js';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Home04Icon,
  BarChartIcon,
  Add01Icon,
  ChartLineData01Icon,
  Settings01Icon,
  Logout01Icon,
  Cancel01Icon,
  SidebarLeft01Icon,
  SidebarRight01Icon,
  ArrowUp01Icon,
  Coffee01Icon,
} from '@hugeicons/core-free-icons';
import { track } from '@vercel/analytics';
import { getProCheckoutUrl } from '../../utils/payment';
import { useUserProfile } from '../../hooks/useUserProfile';
import styles from './Sidebar.module.css';

interface SidebarProps {
  user: User;
  currentPath: string;
  onNavigate: (path: string) => void;
  onSignOut: () => void;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const mainNavItems = [
  { icon: Home04Icon, label: 'Dashboard', path: '/dashboard' },
  { icon: BarChartIcon, label: 'My Polls', path: '/dashboard/polls' },
  { icon: Add01Icon, label: 'Create Poll', path: '/dashboard/create' },
  { icon: ChartLineData01Icon, label: 'Analytics', path: '/dashboard/analytics' },
];

const bottomNavItems = [
  { icon: Settings01Icon, label: 'Settings', path: '/dashboard/settings' },
];

export function Sidebar({ user, currentPath, onNavigate, onSignOut, isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const userEmail = user.email || '';
  const userInitial = displayName.charAt(0).toUpperCase();

  const { data: profile } = useUserProfile(user);
  const isSuperAdmin = profile?.role === 'superadmin';
  const isPro = isSuperAdmin || profile?.plan === 'pro';
  const planLabel = isSuperAdmin ? 'Admin' : isPro ? 'Pro' : 'Free';

  const handleNavClick = (path: string, external?: boolean) => {
    if (external) {
      window.open(path, '_blank', 'noopener,noreferrer');
    } else {
      onNavigate(path);
      onClose();
    }
  };

  const handleUpgradeClick = () => {
    try {
      const checkoutUrl = getProCheckoutUrl({
        email: userEmail,
        userId: user.id,
        customerName: displayName,
      });
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Payment system is temporarily unavailable. Please try again later.');
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
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''} ${isCollapsed ? styles.sidebarCollapsed : ''}`}>
        {/* Header */}
        <div className={styles.sidebarHeader}>
          <button onClick={() => handleNavClick('/')} className={styles.logoButton}>
            <img src="/vs.png" alt="versus.space" className={`${styles.logoImage} ${isCollapsed ? styles.logoCollapsed : ''}`} />
          </button>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close menu">
            <HugeiconsIcon icon={Cancel01Icon} size={20} />
          </button>
          <button
            className={styles.collapseButton}
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            <HugeiconsIcon icon={isCollapsed ? SidebarRight01Icon : SidebarLeft01Icon} size={18} />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className={styles.mainNav}>
          <ul className={styles.navList}>
            {mainNavItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => handleNavClick(item.path)}
                  className={`${styles.navItem} ${isActive(item.path) ? styles.navItemActive : ''} ${isCollapsed ? styles.navItemCollapsed : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className={styles.navIcon}>
                    <HugeiconsIcon icon={item.icon} size={isCollapsed ? 20 : 18} />
                  </span>
                  <span className={`${styles.navLabel} ${isCollapsed ? styles.navLabelHidden : ''}`}>{item.label}</span>
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
                    onClick={() => handleNavClick(item.path)}
                    className={`${styles.navItem} ${isActive(item.path) ? styles.navItemActive : ''} ${isCollapsed ? styles.navItemCollapsed : ''}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className={styles.navIcon}>
                      <HugeiconsIcon icon={item.icon} size={isCollapsed ? 20 : 18} />
                    </span>
                    <span className={`${styles.navLabel} ${isCollapsed ? styles.navLabelHidden : ''}`}>{item.label}</span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={onSignOut}
                  className={`${styles.navItem} ${styles.logoutItem} ${isCollapsed ? styles.navItemCollapsed : ''}`}
                  title={isCollapsed ? 'Logout' : undefined}
                >
                  <span className={styles.navIcon}>
                    <HugeiconsIcon icon={Logout01Icon} size={isCollapsed ? 20 : 18} />
                  </span>
                  <span className={`${styles.navLabel} ${isCollapsed ? styles.navLabelHidden : ''}`}>Logout</span>
                </button>
              </li>
            </ul>
          </nav>

          {/* Upgrade Button - Only for Free Users */}
          {!isPro && (
            <button
              onClick={handleUpgradeClick}
              className={`${styles.upgradeButton} ${isCollapsed ? styles.upgradeButtonCollapsed : ''}`}
              title={isCollapsed ? 'Upgrade to Pro' : undefined}
            >
              <span className={styles.upgradeIcon}>
                <HugeiconsIcon icon={ArrowUp01Icon} size={isCollapsed ? 18 : 16} />
              </span>
              <span className={`${styles.upgradeLabel} ${isCollapsed ? styles.upgradeLabelHidden : ''}`}>
                Upgrade to Pro
              </span>
            </button>
          )}

          {/* Buy Me a Coffee */}
          <a
            href="https://www.buymeacoffee.com/aswinasok"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.coffeeButton} ${isCollapsed ? styles.coffeeButtonCollapsed : ''}`}
            title={isCollapsed ? 'Buy me a chai' : undefined}
            onClick={() => track('buymeacoffee_click', { location: 'sidebar' })}
          >
            <span className={styles.coffeeIcon}>
              <HugeiconsIcon icon={Coffee01Icon} size={isCollapsed ? 18 : 16} />
            </span>
            <span className={`${styles.coffeeLabel} ${isCollapsed ? styles.coffeeLabelHidden : ''}`}>
              Buy me a chai
            </span>
          </a>

          {/* User Profile Section */}
          <div className={`${styles.userSection} ${isCollapsed ? styles.userSectionCollapsed : ''}`}>
            <div className={styles.userInfo}>
              <div className={styles.avatarWrapper}>
                <div className={styles.userAvatar}>{userInitial}</div>
                <span className={`${styles.planBadge} ${isPro ? styles.planPro : styles.planFree}`}>
                  {planLabel}
                </span>
              </div>
              <div className={`${styles.userDetails} ${isCollapsed ? styles.userDetailsHidden : ''}`}>
                <span className={styles.userName}>{displayName}</span>
                <span className={styles.userEmail}>{userEmail}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
