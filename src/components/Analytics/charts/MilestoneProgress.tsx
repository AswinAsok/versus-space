import { useMemo, useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { StarIcon, ChartIncreaseIcon } from '@hugeicons/core-free-icons';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import styles from './MilestoneProgress.module.css';

interface MilestoneProgressProps {
  totalVotes: number;
  loading?: boolean;
}

const MILESTONES = [
  50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000,
  100000, 250000, 500000, 750000, 1000000, 2500000, 5000000, 10000000
];

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
}

export function MilestoneProgress({ totalVotes, loading }: MilestoneProgressProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const milestone = useMemo(() => {
    let nextMilestone = MILESTONES[MILESTONES.length - 1];
    let previousMilestone = 0;

    for (let i = 0; i < MILESTONES.length; i++) {
      if (totalVotes < MILESTONES[i]) {
        nextMilestone = MILESTONES[i];
        previousMilestone = i > 0 ? MILESTONES[i - 1] : 0;
        break;
      }
      previousMilestone = MILESTONES[i];
    }

    const range = nextMilestone - previousMilestone;
    const current = totalVotes - previousMilestone;
    const progress = Math.min((current / range) * 100, 100);
    const votesToNext = nextMilestone - totalVotes;

    return {
      current: totalVotes,
      next: nextMilestone,
      previous: previousMilestone,
      progress,
      votesToNext: Math.max(votesToNext, 0),
    };
  }, [totalVotes]);

  // Animate progress
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(milestone.progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [milestone.progress]);

  // Check for milestone achievement
  useEffect(() => {
    if (MILESTONES.includes(totalVotes)) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [totalVotes]);

  const achievedMilestones = MILESTONES.filter((m) => totalVotes >= m);

  if (loading) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <h3 className={styles.title}>Milestone Progress</h3>
          <Skeleton width={80} height={24} baseColor="rgba(255,255,255,0.02)" highlightColor="rgba(255,255,255,0.05)" borderRadius={12} />
        </div>
        <div className={styles.skeletonContent}>
          <Skeleton width={100} height={48} baseColor="rgba(255,255,255,0.02)" highlightColor="rgba(255,255,255,0.05)" />
          <Skeleton width={70} height={14} baseColor="rgba(255,255,255,0.02)" highlightColor="rgba(255,255,255,0.05)" style={{ marginTop: 8 }} />
        </div>
        <div className={styles.skeletonProgress}>
          <Skeleton height={8} baseColor="rgba(255,255,255,0.02)" highlightColor="rgba(255,255,255,0.05)" borderRadius={4} />
        </div>
        <div className={styles.skeletonFooter}>
          <Skeleton width={120} height={14} baseColor="rgba(255,255,255,0.02)" highlightColor="rgba(255,255,255,0.05)" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${showCelebration ? styles.celebrating : ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Milestone Progress</h3>
        <div className={styles.badge}>
          <HugeiconsIcon icon={ChartIncreaseIcon} size={14} />
          <span>{achievedMilestones.length} achieved</span>
        </div>
      </div>

      {/* Main Stats */}
      <div className={styles.mainStats}>
        <div className={styles.currentVotes}>
          <span className={styles.votesNumber}>{totalVotes.toLocaleString()}</span>
          <span className={styles.votesLabel}>total votes</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressSection}>
        <div className={styles.progressLabels}>
          <span className={styles.progressFrom}>{formatNumber(milestone.previous)}</span>
          <span className={styles.progressTo}>{formatNumber(milestone.next)}</span>
        </div>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${animatedProgress}%` }}
          />
          <div
            className={styles.progressGlow}
            style={{ left: `${animatedProgress}%` }}
          />
        </div>
        <div className={styles.progressInfo}>
          <span className={styles.progressPercent}>{Math.round(milestone.progress)}%</span>
          <span className={styles.progressRemaining}>
            {milestone.votesToNext.toLocaleString()} to go
          </span>
        </div>
      </div>

      {/* Next Milestone */}
      <div className={styles.nextMilestone}>
        <HugeiconsIcon icon={StarIcon} size={14} />
        <span>Next: {formatNumber(milestone.next)} votes</span>
      </div>

      {showCelebration && (
        <div className={styles.celebration}>
          <span className={styles.celebrationText}>Milestone achieved!</span>
        </div>
      )}
    </div>
  );
}
