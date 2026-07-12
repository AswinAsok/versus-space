import styles from './FreeLimitUpgradeBanner.module.css';

interface FreeLimitUpgradeBannerProps {
  onUpgrade?: () => void;
  href?: string;
}

export function FreeLimitUpgradeBanner({ onUpgrade, href }: FreeLimitUpgradeBannerProps) {
  const label = 'Upgrade to Pro';

  return (
    <div className={styles.upgradeBanner}>
      <div className={styles.upgradeBannerContent}>
        <span className={styles.upgradeBannerText}>
          Congratulations! You are eligible for an upgrade
        </span>
        {href ? (
          <a href={href} className={styles.upgradeBannerButton}>
            {label}
          </a>
        ) : (
          <button type="button" onClick={onUpgrade} className={styles.upgradeBannerButton}>
            {label}
          </button>
        )}
      </div>
    </div>
  );
}
