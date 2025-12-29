import { useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import styles from './VotingHeatmap.module.css';

interface VotingHeatmapProps {
  voteTimestamps: Date[];
  totalVotesAllPolls: number; // Total votes including simulated
  loading?: boolean;
  showProBadge?: boolean;
  proDescription?: string;
}

interface DayData {
  date: Date;
  count: number;
  level: number;
}

export function VotingHeatmap({ voteTimestamps, totalVotesAllPolls, loading, showProBadge, proDescription }: VotingHeatmapProps) {
  const trackedVoteCount = voteTimestamps.length;

  const { days, weeks, months } = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Count tracked votes per day
    const voteCounts = new Map<string, number>();
    voteTimestamps.forEach((timestamp) => {
      const key = formatDateKey(timestamp);
      voteCounts.set(key, (voteCounts.get(key) || 0) + 1);
    });

    // Generate exactly 365 days of data (full year) - only show actual tracked votes
    const daysArray: DayData[] = [];
    const counts: number[] = [];

    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const count = voteCounts.get(formatDateKey(date)) || 0;
      counts.push(count);
      daysArray.push({ date, count, level: 0 });
    }

    // Calculate levels based on counts
    const maxCount = Math.max(...counts, 1);
    daysArray.forEach((day) => {
      day.level = getLevel(day.count, maxCount);
    });

    // Calculate number of weeks (columns)
    const firstDayOfWeek = daysArray[0].date.getDay(); // 0 = Sunday
    const totalCells = firstDayOfWeek + 365;
    const numWeeks = Math.ceil(totalCells / 7);

    // Build month labels
    const monthLabels: { label: string; week: number }[] = [];
    let lastMonth = -1;

    daysArray.forEach((day, index) => {
      const month = day.date.getMonth();
      if (month !== lastMonth) {
        const cellIndex = firstDayOfWeek + index;
        const week = Math.floor(cellIndex / 7);
        monthLabels.push({
          label: day.date.toLocaleDateString('en-US', { month: 'short' }),
          week
        });
        lastMonth = month;
      }
    });

    return {
      days: daysArray,
      weeks: numWeeks,
      months: monthLabels
    };
  }, [voteTimestamps]);

  function formatDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function getLevel(count: number, max: number): number {
    if (count === 0) return 0;
    const ratio = count / max;
    if (ratio < 0.25) return 1;
    if (ratio < 0.5) return 2;
    if (ratio < 0.75) return 3;
    return 4;
  }

  function formatTooltip(day: DayData): string {
    const dateStr = day.date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    return `${dateStr}: ${day.count.toLocaleString()} vote${day.count !== 1 ? 's' : ''}`;
  }

  // Build the grid cells
  const gridCells = useMemo(() => {
    const cells: (DayData | null)[] = [];
    const firstDayOfWeek = days[0]?.date.getDay() || 0;

    // Add empty cells for padding at the start
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(null);
    }

    // Add all the days
    days.forEach(day => {
      cells.push(day);
    });

    // Pad to complete the last week
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return cells;
  }, [days]);

  if (loading) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <h3 className={styles.title}>Vote Activity</h3>
          <Skeleton width={200} height={14} baseColor="rgba(255,255,255,0.02)" highlightColor="rgba(255,255,255,0.05)" />
        </div>
        <div className={styles.skeletonGrid}>
          <Skeleton height={120} baseColor="rgba(255,255,255,0.02)" highlightColor="rgba(255,255,255,0.05)" borderRadius={4} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      {proDescription && <p className={styles.proDescription}>{proDescription}</p>}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>Vote Activity</h3>
            {showProBadge && <span className={styles.proBadge}>Pro</span>}
          </div>
        </div>
        <span className={styles.subtitle}>
          {trackedVoteCount.toLocaleString()} tracked votes in the last year
        </span>
      </div>

      <div className={styles.graphWrapper}>
        {/* Month labels */}
        <div className={styles.monthRow}>
          <div className={styles.dayLabelSpacer} />
          <div className={styles.monthLabels}>
            {Array.from({ length: weeks }).map((_, weekIndex) => {
              const monthLabel = months.find(m => m.week === weekIndex);
              return (
                <div key={weekIndex} className={styles.monthCell}>
                  {monthLabel?.label || ''}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main grid area */}
        <div className={styles.gridRow}>
          {/* Day labels */}
          <div className={styles.dayLabels}>
            <div className={styles.dayLabel}></div>
            <div className={styles.dayLabel}>Mon</div>
            <div className={styles.dayLabel}></div>
            <div className={styles.dayLabel}>Wed</div>
            <div className={styles.dayLabel}></div>
            <div className={styles.dayLabel}>Fri</div>
            <div className={styles.dayLabel}></div>
          </div>

          {/* Grid */}
          <div
            className={styles.grid}
            style={{
              gridTemplateColumns: `repeat(${weeks}, 1fr)`,
              gridTemplateRows: 'repeat(7, 1fr)'
            }}
          >
            {gridCells.map((cell, index) => (
              <div
                key={index}
                className={styles.cell}
                data-level={cell?.level ?? -1}
                title={cell ? formatTooltip(cell) : ''}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className={styles.legend}>
          <span>Less</span>
          <div className={styles.cell} data-level="0" />
          <div className={styles.cell} data-level="1" />
          <div className={styles.cell} data-level="2" />
          <div className={styles.cell} data-level="3" />
          <div className={styles.cell} data-level="4" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
