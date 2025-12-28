import { useState, useEffect } from 'react';
import styles from './MouseLoader.module.css';

interface MouseLoaderProps {
  message?: string;
}

export function MouseLoader({ message = "Teaching our mouse to click faster..." }: MouseLoaderProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < message.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(message.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 80);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, message]);

  const textWithoutLast = displayedText.slice(0, -1);
  const lastChar = displayedText.slice(-1);

  return (
    <div className={styles.container}>
      <div className={styles.loaderArea}>
        {/* +1 text that floats up at each click position */}
        <div className={`${styles.plusOne} ${styles.plus1}`}>+1</div>
        <div className={`${styles.plusOne} ${styles.plus2}`}>+1</div>
        <div className={`${styles.plusOne} ${styles.plus3}`}>+1</div>

        {/* Mouse cursor */}
        <div className={styles.cursor}>
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={styles.cursorIcon}
          >
            <path d="M4 0l16 12.279-6.951 1.17 4.325 8.817-3.596 1.734-4.35-8.879-5.428 4.702z" />
          </svg>
        </div>
      </div>
      <p className={styles.message}>
        {textWithoutLast}
        <span className={styles.lastChar}>{lastChar}</span>
        <span className={styles.caret} />
      </p>
    </div>
  );
}
