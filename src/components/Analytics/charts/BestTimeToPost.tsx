import { useState, useEffect, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { StarIcon } from '@hugeicons/core-free-icons';
import { supabase } from '../../../lib/supabaseClient';
import styles from './BestTimeToPost.module.css';

interface BestTimeToPostProps {
  pollIds: string[];
}

interface HourlyData {
  dayOfWeek: number;
  hour: number;
  count: number;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = [0, 3, 6, 9, 12, 15, 18, 21];

export function BestTimeToPost({ pollIds }: BestTimeToPostProps) {
  const [data, setData] = useState<HourlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pollIds.length === 0) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const { data: votes } = await supabase
          .from('votes')
          .select('created_at')
          .in('poll_id', pollIds);

        if (votes) {
          // Process votes into hourly buckets
          const hourlyMap = new Map<string, number>();

          votes.forEach((vote) => {
            const date = new Date(vote.created_at);
            const dayOfWeek = date.getDay();
            const hour = date.getHours();
            // Group into 3-hour blocks
            const hourBlock = Math.floor(hour / 3) * 3;
            const key = `${dayOfWeek}-${hourBlock}`;
            hourlyMap.set(key, (hourlyMap.get(key) || 0) + 1);
          });

          const hourlyData: HourlyData[] = [];
          for (let day = 0; day < 7; day++) {
            for (const hour of HOURS) {
              const key = `${day}-${hour}`;
              hourlyData.push({
                dayOfWeek: day,
                hour,
                count: hourlyMap.get(key) || 0,
              });
            }
          }

          setData(hourlyData);
        }
      } catch (err) {
        console.error('Failed to fetch time data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pollIds]);

  // Calculate max for color intensity
  const maxCount = useMemo(() => {
    return Math.max(...data.map((d) => d.count), 1);
  }, [data]);

  // Find best time
  const bestTime = useMemo(() => {
    if (data.length === 0) return null;

    const sorted = [...data].sort((a, b) => b.count - a.count);
    const best = sorted[0];

    if (best.count === 0) return null;

    const dayName = DAYS[best.dayOfWeek];
    const startHour = best.hour;
    const endHour = best.hour + 3;
    const formatHour = (h: number) => {
      if (h === 0 || h === 24) return '12am';
      if (h === 12) return '12pm';
      if (h > 12) return `${h - 12}pm`;
      return `${h}am`;
    };

    return {
      day: dayName,
      timeRange: `${formatHour(startHour)}-${formatHour(endHour)}`,
      votes: best.count,
    };
  }, [data]);

  // Calculate multiplier for best time
  const avgCount = useMemo(() => {
    if (data.length === 0) return 0;
    const total = data.reduce((sum, d) => sum + d.count, 0);
    return total / data.length;
  }, [data]);

  const multiplier = bestTime && avgCount > 0 ? (bestTime.votes / avgCount).toFixed(1) : '0';

  const getIntensity = (count: number): number => {
    if (count === 0) return 0;
    return Math.min(count / maxCount, 1);
  };

  const getColorStyle = (count: number): React.CSSProperties => {
    const intensity = getIntensity(count);
    if (intensity === 0) {
      return { backgroundColor: 'rgba(255, 255, 255, 0.03)' };
    }
    return {
      backgroundColor: `rgba(62, 207, 142, ${0.15 + intensity * 0.6})`,
    };
  };

  if (loading) {
    return (
      <div className={styles.card}>
        <h3 className={styles.title}>Best Time to Post</h3>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
        </div>
      </div>
    );
  }

  const hasData = data.some((d) => d.count > 0);

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Best Time to Post</h3>

      {!hasData ? (
        <div className={styles.empty}>
          <p>Not enough vote data yet</p>
          <span className={styles.emptyHint}>Pattern will emerge as more votes come in</span>
        </div>
      ) : (
        <>
          {/* Insight Banner */}
          {bestTime && (
            <div className={styles.insight}>
              <HugeiconsIcon icon={StarIcon} size={16} />
              <span>
                Your polls get <strong>{multiplier}x</strong> more votes on{' '}
                <strong>{bestTime.day}</strong> between{' '}
                <strong>{bestTime.timeRange}</strong>
              </span>
            </div>
          )}

          {/* Heatmap Grid */}
          <div className={styles.heatmapContainer}>
            <div className={styles.heatmap}>
              {/* Hour Labels */}
              <div className={styles.hourLabels}>
                <div className={styles.cornerSpace} />
                {HOURS.map((hour) => (
                  <div key={hour} className={styles.hourLabel}>
                    {hour === 0 ? '12a' : hour === 12 ? '12p' : hour > 12 ? `${hour - 12}p` : `${hour}a`}
                  </div>
                ))}
              </div>

              {/* Grid Rows */}
              {DAYS.map((day, dayIndex) => (
                <div key={day} className={styles.row}>
                  <div className={styles.dayLabel}>{day}</div>
                  {HOURS.map((hour) => {
                    const cellData = data.find(
                      (d) => d.dayOfWeek === dayIndex && d.hour === hour
                    );
                    const count = cellData?.count || 0;

                    return (
                      <div
                        key={`${day}-${hour}`}
                        className={styles.cell}
                        style={getColorStyle(count)}
                        title={`${day} ${hour}:00 - ${count} votes`}
                      >
                        {count > 0 && count >= maxCount * 0.5 && (
                          <span className={styles.cellValue}>{count}</span>
                        )}
                      </div>
                    );
                  })}
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
                    style={{
                      backgroundColor:
                        intensity === 0
                          ? 'rgba(255, 255, 255, 0.03)'
                          : `rgba(62, 207, 142, ${0.15 + intensity * 0.6})`,
                    }}
                  />
                ))}
              </div>
              <span className={styles.legendLabel}>More</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
