import { useMemo } from 'react';
import styles from './VotingHeatmap.module.css';

interface VotingHeatmapProps {
  voteTimestamps: Date[];
  loading?: boolean;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function VotingHeatmap({ voteTimestamps, loading }: VotingHeatmapProps) {
  const heatmapData = useMemo(() => {
    // Initialize grid with zeros
    const grid: number[][] = Array(7).fill(null).map(() => Array(24).fill(0));

    // Count votes for each hour/day combination
    voteTimestamps.forEach((timestamp) => {
      const day = timestamp.getDay();
      const hour = timestamp.getHours();
      grid[day][hour]++;
    });

    // Find max for normalization
    const max = Math.max(...grid.flat(), 1);

    return { grid, max };
  }, [voteTimestamps]);

  const getIntensity = (count: number): number => {
    if (count === 0) return 0;
    return Math.min(count / heatmapData.max, 1);
  };

  const getColor = (intensity: number): string => {
    if (intensity === 0) return 'rgba(255, 255, 255, 0.03)';
    // Gradient from dim green to bright green
    const alpha = 0.2 + intensity * 0.8;
    return `rgba(62, 207, 142, ${alpha})`;
  };

  if (loading) {
    return (
      <div className={styles.heatmapCard}>
        <h3 className={styles.heatmapTitle}>Voting Patterns</h3>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <p>Loading heatmap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.heatmapCard}>
      <h3 className={styles.heatmapTitle}>Voting Patterns</h3>
      <p className={styles.heatmapSubtitle}>When your audience votes most</p>

      <div className={styles.heatmapContainer}>
        {/* Hour labels */}
        <div className={styles.hourLabels}>
          <div className={styles.cornerSpacer} />
          {HOURS.filter((h) => h % 3 === 0).map((hour) => (
            <span key={hour} className={styles.hourLabel}>
              {hour === 0 ? '12a' : hour === 12 ? '12p' : hour > 12 ? `${hour - 12}p` : `${hour}a`}
            </span>
          ))}
        </div>

        {/* Grid */}
        <div className={styles.gridContainer}>
          {DAYS.map((day, dayIndex) => (
            <div key={day} className={styles.dayRow}>
              <span className={styles.dayLabel}>{day}</span>
              <div className={styles.hourCells}>
                {HOURS.map((hour) => {
                  const count = heatmapData.grid[dayIndex][hour];
                  const intensity = getIntensity(count);
                  return (
                    <div
                      key={hour}
                      className={styles.cell}
                      style={{ backgroundColor: getColor(intensity) }}
                      title={`${day} ${hour}:00 - ${count} votes`}
                    >
                      {count > 0 && intensity > 0.5 && (
                        <span className={styles.cellCount}>{count}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className={styles.legend}>
          <span className={styles.legendLabel}>Less</span>
          <div className={styles.legendGradient}>
            {[0, 0.25, 0.5, 0.75, 1].map((intensity) => (
              <div
                key={intensity}
                className={styles.legendCell}
                style={{ backgroundColor: getColor(intensity) }}
              />
            ))}
          </div>
          <span className={styles.legendLabel}>More</span>
        </div>
      </div>

      <p className={styles.heatmapFootnote}>
        Shows voting activity by hour and day of week. Based on manual votes only.
      </p>
    </div>
  );
}
