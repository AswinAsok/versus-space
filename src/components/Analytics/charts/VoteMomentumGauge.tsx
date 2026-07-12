import { useState, useEffect, useRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Fire02Icon, ArrowUp01Icon, ArrowDown01Icon } from '@hugeicons/core-free-icons';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { realtimeFacade, voteFacade } from '../../../core/appServices';
import chartStyles from './Charts.module.css';
import styles from './VoteMomentumGauge.module.css';

interface VoteMomentumGaugeProps {
  pollIds: string[];
  showProBadge?: boolean;
  proDescription?: string;
  useDummyData?: boolean;
}

export function VoteMomentumGauge({
  pollIds,
  showProBadge,
  proDescription,
  useDummyData = false,
}: VoteMomentumGaugeProps) {
  const [currentHourVotes, setCurrentHourVotes] = useState(0);
  const [averageHourlyVotes, setAverageHourlyVotes] = useState(0);
  const [lastHourVotes, setLastHourVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const animatedValue = useRef(0);
  const [displayValue, setDisplayValue] = useState(0);

  // Simulate dummy data for demo mode
  useEffect(() => {
    if (!useDummyData) return;

    // Set initial dummy values
    setCurrentHourVotes(12);
    setAverageHourlyVotes(8);
    setLastHourVotes(9);
    setLoading(false);

    // Simulate real-time updates
    const interval = setInterval(() => {
      if (Math.random() < 0.3) {
        setCurrentHourVotes((prev) => prev + 1);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [useDummyData]);

  // Calculate momentum metrics (only for real data)
  useEffect(() => {
    if (useDummyData || pollIds.length === 0) {
      if (!useDummyData) setLoading(false);
      return;
    }

    const fetchMomentum = async () => {
      try {
        const momentum = await voteFacade.getMomentumStats(pollIds);
        setCurrentHourVotes(momentum.currentHour);
        setLastHourVotes(momentum.previousHour);
        setAverageHourlyVotes(momentum.averageHourly);
      } catch (err) {
        console.error('Failed to fetch momentum:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMomentum();

    // Refresh every minute
    const interval = setInterval(fetchMomentum, 60000);
    return () => clearInterval(interval);
  }, [pollIds, useDummyData]);

  // Subscribe to real-time votes (only for real data)
  useEffect(() => {
    if (useDummyData || pollIds.length === 0) return;

    return realtimeFacade.subscribeToPolls(pollIds, {
      role: 'observer',
      viewerId: `momentum-${crypto.randomUUID()}`,
      onVote: () => setCurrentHourVotes((prev) => prev + 1),
    });
  }, [pollIds, useDummyData]);

  // Animate the display value
  useEffect(() => {
    const target = currentHourVotes;
    const start = animatedValue.current;
    const duration = 500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * eased);

      setDisplayValue(current);
      animatedValue.current = current;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [currentHourVotes]);

  const isHot = currentHourVotes > averageHourlyVotes * 1.5;
  const trend =
    currentHourVotes > lastHourVotes ? 'up' : currentHourVotes < lastHourVotes ? 'down' : 'stable';
  const multiplier =
    averageHourlyVotes > 0 ? (currentHourVotes / averageHourlyVotes).toFixed(1) : '0';

  // Calculate gauge percentage (0-100)
  const maxVotes = Math.max(averageHourlyVotes * 5, 50);
  const gaugePercent = Math.min((currentHourVotes / maxVotes) * 100, 100);

  if (loading) {
    return (
      <div className={styles.gaugeCard}>
        <div className={styles.header}>
          <h3 className={styles.title}>Vote Momentum</h3>
        </div>
        <div className={styles.skeletonContent}>
          <Skeleton
            width={80}
            height={48}
            baseColor="rgba(255,255,255,0.02)"
            highlightColor="rgba(255,255,255,0.05)"
          />
          <Skeleton
            width={60}
            height={14}
            baseColor="rgba(255,255,255,0.02)"
            highlightColor="rgba(255,255,255,0.05)"
            style={{ marginTop: 8 }}
          />
        </div>
        <div className={styles.skeletonGauge}>
          <Skeleton
            height={8}
            baseColor="rgba(255,255,255,0.02)"
            highlightColor="rgba(255,255,255,0.05)"
            borderRadius={4}
          />
        </div>
        <div className={styles.skeletonStats}>
          <Skeleton
            width={60}
            height={32}
            baseColor="rgba(255,255,255,0.02)"
            highlightColor="rgba(255,255,255,0.05)"
          />
          <Skeleton
            width={60}
            height={32}
            baseColor="rgba(255,255,255,0.02)"
            highlightColor="rgba(255,255,255,0.05)"
          />
          <Skeleton
            width={60}
            height={32}
            baseColor="rgba(255,255,255,0.02)"
            highlightColor="rgba(255,255,255,0.05)"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.gaugeCard} ${isHot ? styles.hot : ''}`}>
      {proDescription && <p className={styles.proDescription}>{proDescription}</p>}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>Vote Momentum</h3>
            {showProBadge && <span className={chartStyles.proBadge}>Pro</span>}
          </div>
        </div>
        {isHot && (
          <div className={styles.hotBadge}>
            <HugeiconsIcon icon={Fire02Icon} size={14} />
            <span>HOT</span>
          </div>
        )}
      </div>

      {/* Main Value */}
      <div className={styles.mainValue}>
        <span className={styles.valueNumber}>{displayValue}</span>
        <span className={styles.valueUnit}>votes/hr</span>
      </div>

      {/* Progress Bar Gauge */}
      <div className={styles.gaugeSection}>
        <div className={styles.gaugeTrack}>
          <div className={styles.gaugeFill} style={{ width: `${gaugePercent}%` }} />
          <div className={styles.gaugeGlow} style={{ left: `${gaugePercent}%` }} />
        </div>
        <div className={styles.gaugeLabels}>
          <span>0</span>
          <span>{maxVotes}</span>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Average</span>
          <span className={styles.statValue}>{averageHourlyVotes}/hr</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Multiplier</span>
          <span className={`${styles.statValue} ${isHot ? styles.hotValue : ''}`}>
            {multiplier}x
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Trend</span>
          <span className={`${styles.statValue} ${styles.trend} ${styles[trend]}`}>
            {trend === 'up' && <HugeiconsIcon icon={ArrowUp01Icon} size={14} />}
            {trend === 'down' && <HugeiconsIcon icon={ArrowDown01Icon} size={14} />}
            {trend === 'stable' && '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
