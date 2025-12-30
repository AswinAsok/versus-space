import styles from './ProductHuntBanner.module.css';

export function ProductHuntBanner() {
  const bannerContent = (
    <>
      <img
        src="/pngkey.com-reddit-logo-png-10768.png"
        alt="Product Hunt Kitty"
        className={styles.kitty}
      />
      <span>We just dropped on Product Hunt</span>
      <span className={styles.separator}>•</span>
      <span className={styles.promoCode}>
        <strong>PHLAUNCH25</strong> = 25% off (you're welcome)
      </span>
    </>
  );

  return (
    <a
      href="https://www.producthunt.com/products/versus-space"
      target="_blank"
      rel="noopener noreferrer"
      className={styles.banner}
    >
      <div className={styles.marqueeWrapper}>
        <div className={styles.marquee}>
          <div className={styles.marqueeContent}>
            {bannerContent}
            <span className={styles.spacer} />
            {bannerContent}
            <span className={styles.spacer} />
            {bannerContent}
            <span className={styles.spacer} />
            {bannerContent}
            <span className={styles.spacer} />
          </div>
          <div className={styles.marqueeContent} aria-hidden="true">
            {bannerContent}
            <span className={styles.spacer} />
            {bannerContent}
            <span className={styles.spacer} />
            {bannerContent}
            <span className={styles.spacer} />
            {bannerContent}
            <span className={styles.spacer} />
          </div>
        </div>
      </div>
    </a>
  );
}
