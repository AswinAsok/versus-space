import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Mail01Icon,
  Key01Icon,
  Link01Icon,
  AlertCircleIcon,
  Tick01Icon,
} from '@hugeicons/core-free-icons';
import styles from './Settings.module.css';

interface SettingsProps {
  user: User;
}

export function Settings({ user }: SettingsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isGoogleUser = user.app_metadata?.provider === 'google';

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.settingsInner}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Settings</h1>
          <p className={styles.pageSubtitle}>Manage your account preferences and security</p>
        </div>

        {/* Account Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Account</h2>

          <div className={styles.settingCard}>
            <div className={styles.settingItem}>
              <div className={styles.settingIcon}>
                <HugeiconsIcon icon={Mail01Icon} size={20} />
              </div>
              <div className={styles.settingContent}>
                <h3 className={styles.settingLabel}>Email address</h3>
                <p className={styles.settingValue}>{user.email}</p>
              </div>
              <span className={styles.verifiedBadge}>
                <HugeiconsIcon icon={Tick01Icon} size={14} />
                Verified
              </span>
            </div>

            {!isGoogleUser && (
              <div className={styles.settingItem}>
                <div className={styles.settingIcon}>
                  <HugeiconsIcon icon={Key01Icon} size={20} />
                </div>
                <div className={styles.settingContent}>
                  <h3 className={styles.settingLabel}>Password</h3>
                  <p className={styles.settingDescription}>Change your account password</p>
                </div>
                <button className={styles.settingAction}>Change</button>
              </div>
            )}
          </div>
        </section>

        {/* Connected Accounts Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Connected Accounts</h2>

          <div className={styles.settingCard}>
            <div className={styles.settingItem}>
              <div className={styles.settingIcon}>
                <svg className={styles.googleIcon} viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              <div className={styles.settingContent}>
                <h3 className={styles.settingLabel}>Google</h3>
                <p className={styles.settingDescription}>
                  {isGoogleUser ? 'Connected via Google OAuth' : 'Not connected'}
                </p>
              </div>
              {isGoogleUser ? (
                <span className={styles.connectedBadge}>
                  <HugeiconsIcon icon={Link01Icon} size={14} />
                  Connected
                </span>
              ) : (
                <button className={styles.settingAction}>Connect</button>
              )}
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className={styles.section}>
          <h2 className={`${styles.sectionTitle} ${styles.dangerTitle}`}>Danger Zone</h2>

          <div className={`${styles.settingCard} ${styles.dangerCard}`}>
            <div className={styles.settingItem}>
              <div className={`${styles.settingIcon} ${styles.dangerIcon}`}>
                <HugeiconsIcon icon={AlertCircleIcon} size={20} />
              </div>
              <div className={styles.settingContent}>
                <h3 className={styles.settingLabel}>Delete Account</h3>
                <p className={styles.settingDescription}>
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <button
                className={styles.dangerButton}
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete
              </button>
            </div>
          </div>
        </section>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className={styles.modalOverlay} onClick={() => setShowDeleteConfirm(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalIcon}>
                <HugeiconsIcon icon={AlertCircleIcon} size={32} />
              </div>
              <h3 className={styles.modalTitle}>Delete Account?</h3>
              <p className={styles.modalText}>
                This will permanently delete your account, all your polls, and associated data.
                This action cannot be undone.
              </p>
              <div className={styles.modalActions}>
                <button
                  className={styles.modalCancelButton}
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button className={styles.modalDeleteButton}>
                  Yes, delete my account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
