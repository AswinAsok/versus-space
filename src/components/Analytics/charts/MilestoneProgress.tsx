import { useMemo, useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { StarIcon, ChartIncreaseIcon } from '@hugeicons/core-free-icons';
import styles from './MilestoneProgress.module.css';

interface MilestoneProgressProps {
  totalVotes: number;
}

const MILESTONES = [50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];

export function MilestoneProgress({ totalVotes }: MilestoneProgressProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const milestone = useMemo(() => {
    // Find next milestone
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

  // Calculate SVG arc
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  // Get recently achieved milestones
  const achievedMilestones = MILESTONES.filter((m) => totalVotes >= m);
  const lastAchieved = achievedMilestones[achievedMilestones.length - 1];

  return (
    <div className={`${styles.card} ${showCelebration ? styles.celebrating : ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Milestone Progress</h3>
        <div className={styles.badge}>
          <HugeiconsIcon icon={ChartIncreaseIcon} size={14} />
          <span>{achievedMilestones.length} achieved</span>
        </div>
      </div>

      <div className={styles.ringContainer}>
        <svg viewBox="0 0 180 180" className={styles.ring}>
          {/* Background circle */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth="12"
          />
          {/* Progress arc */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={styles.progressArc}
            transform="rotate(-90 90 90)"
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3ecf8e" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
        </svg>

        <div className={styles.ringContent}>
          <span className={styles.currentValue}>
            {totalVotes.toLocaleString()}
          </span>
          <span className={styles.divider}>/</span>
          <span className={styles.targetValue}>
            {milestone.next.toLocaleString()}
          </span>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{Math.round(milestone.progress)}%</span>
          <span className={styles.statLabel}>Progress</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statValue}>{milestone.votesToNext.toLocaleString()}</span>
          <span className={styles.statLabel}>Votes to go</span>
        </div>
      </div>

      {lastAchieved && (
        <div className={styles.lastAchieved}>
          <HugeiconsIcon icon={StarIcon} size={14} />
          <span>Last milestone: {lastAchieved.toLocaleString()} votes</span>
        </div>
      )}

      {showCelebration && (
        <div className={styles.celebration}>
          <span className={styles.celebrationEmoji}>🎉</span>
          <span className={styles.celebrationText}>
            Milestone achieved!
          </span>
        </div>
      )}
    </div>
  );
}
