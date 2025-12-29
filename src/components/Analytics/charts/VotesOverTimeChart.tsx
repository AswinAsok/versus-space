import { useMemo, useState, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import type { VoteDailyCount } from '../../../types';
import styles from './Charts.module.css';
import chartStyles from './VotesOverTimeChart.module.css';

interface VotesOverTimeChartProps {
  data: Map<string, VoteDailyCount[]>;
  pollTitles: Map<string, string>;
  loading?: boolean;
  days: number;
}

const CHART_COLORS = [
  '#3ecf8e', // primary green
  '#94a3b8', // muted slate
  '#78716c', // warm stone
];

export function VotesOverTimeChart({ data, pollTitles, loading, days }: VotesOverTimeChartProps) {
  const [hiddenPolls, setHiddenPolls] = useState<Set<string>>(new Set());

  // Get only poll IDs that have votes in the time range (filter out 0-vote polls)
  const allPollIds = useMemo(() => {
    const pollsWithVotes: string[] = [];
    data.forEach((votes, pollId) => {
      const totalVotes = votes.reduce((sum, v) => sum + v.count, 0);
      if (totalVotes > 0) {
        pollsWithVotes.push(pollId);
      }
    });
    return pollsWithVotes;
  }, [data]);

  // Visible poll IDs (not hidden)
  const visiblePollIds = useMemo(() => {
    return allPollIds.filter(id => !hiddenPolls.has(id));
  }, [allPollIds, hiddenPolls]);

  // Toggle poll visibility
  const handleLegendClick = useCallback((pollId: string) => {
    setHiddenPolls(prev => {
      const next = new Set(prev);
      if (next.has(pollId)) {
        next.delete(pollId);
      } else {
        next.add(pollId);
      }
      return next;
    });
  }, []);

  const chartData = useMemo(() => {
    // For 24h view, show hourly data
    if (days === 1) {
      const hours: string[] = [];
      const now = new Date();

      // Generate last 24 hours
      for (let i = 23; i >= 0; i--) {
        const hour = new Date(now);
        hour.setHours(now.getHours() - i, 0, 0, 0);
        const hourKey = `${hour.getFullYear()}-${String(hour.getMonth() + 1).padStart(2, '0')}-${String(hour.getDate()).padStart(2, '0')}-${String(hour.getHours()).padStart(2, '0')}`;
        hours.push(hourKey);
      }

      const formatHourLabel = (hourKey: string) => {
        const hour = parseInt(hourKey.split('-')[3], 10);
        if (hour === 0) return '12am';
        if (hour === 12) return '12pm';
        return hour > 12 ? `${hour - 12}pm` : `${hour}am`;
      };

      return hours.map((hourKey) => {
        const point: Record<string, string | number> = {
          date: formatHourLabel(hourKey),
          fullDate: hourKey,
        };

        allPollIds.forEach((pollId) => {
          const votes = data.get(pollId) || [];
          const hourVotes = votes.find((v) => v.date === hourKey);
          point[pollId] = hourVotes?.count || 0;
        });

        return point;
      });
    }

    // For other ranges, show daily data
    const allDates: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      allDates.push(localDate);
    }

    const formatLabel = (dateStr: string) => {
      const date = new Date(dateStr);
      if (days === 3) {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (days <= 7) {
        return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      }
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return allDates.map((date) => {
      const point: Record<string, string | number> = {
        date: formatLabel(date),
        fullDate: date,
      };

      allPollIds.forEach((pollId) => {
        const votes = data.get(pollId) || [];
        const dayVotes = votes.find((v) => v.date === date);
        point[pollId] = dayVotes?.count || 0;
      });

      return point;
    });
  }, [data, allPollIds, days]);

  // Check if there are any real votes at all
  const hasAnyVotes = useMemo(() => {
    for (const votes of data.values()) {
      if (votes.some(v => v.count > 0)) return true;
    }
    return false;
  }, [data]);

  if (loading) {
    return (
      <div className={styles.chartCard}>
        <div className={styles.skeletonLine}>
          <Skeleton height={250} baseColor="rgba(255,255,255,0.02)" highlightColor="rgba(255,255,255,0.05)" borderRadius={8} />
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <Skeleton width={80} height={14} baseColor="rgba(255,255,255,0.02)" highlightColor="rgba(255,255,255,0.05)" />
            <Skeleton width={80} height={14} baseColor="rgba(255,255,255,0.02)" highlightColor="rgba(255,255,255,0.05)" />
          </div>
        </div>
      </div>
    );
  }

  if (allPollIds.length === 0) {
    return (
      <div className={styles.chartCard}>
        <div className={styles.chartEmpty}>
          <p>No polls available.</p>
        </div>
      </div>
    );
  }

  if (!hasAnyVotes) {
    return (
      <div className={styles.chartCard}>
        <div className={styles.chartEmpty}>
          <p>No votes in the last {days} days</p>
        </div>
      </div>
    );
  }

  // Calculate tick interval based on days
  // For 24h view (24 data points), show every 3rd hour
  const tickInterval = days === 1 ? 2 : days <= 7 ? 0 : days <= 30 ? 4 : 13;

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              {allPollIds.map((pollId, index) => (
                <linearGradient key={pollId} id={`gradient-${pollId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS[index % CHART_COLORS.length]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS[index % CHART_COLORS.length]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="date"
              stroke="rgba(255,255,255,0.4)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval={tickInterval}
            />
            <YAxis
              stroke="rgba(255,255,255,0.4)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(20, 22, 26, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}
              labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: '4px' }}
              itemStyle={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}
              formatter={(value: number, name: string) => [
                value,
                pollTitles.get(name) || name,
              ]}
              filterNull={false}
              itemSorter={(item) => -(item.value as number || 0)}
            />
            <Legend
              wrapperStyle={{ paddingTop: '16px' }}
              onClick={(e) => {
                if (e && e.dataKey) {
                  handleLegendClick(e.dataKey as string);
                }
              }}
              formatter={(value) => {
                const isHidden = hiddenPolls.has(value);
                const title = pollTitles.get(value) || value;
                const displayTitle = title.length > 20 ? title.slice(0, 20) + '...' : title;
                return (
                  <span
                    className={chartStyles.legendItem}
                    style={{
                      color: isHidden ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)',
                      textDecoration: isHidden ? 'line-through' : 'none',
                    }}
                  >
                    {displayTitle}
                  </span>
                );
              }}
            />
            {allPollIds.map((pollId, index) => (
              <Area
                key={pollId}
                type="monotone"
                dataKey={pollId}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth={hiddenPolls.has(pollId) ? 0 : 2}
                fill={hiddenPolls.has(pollId) ? 'transparent' : `url(#gradient-${pollId})`}
                dot={false}
                activeDot={hiddenPolls.has(pollId) ? false : { r: 5, strokeWidth: 0 }}
                hide={hiddenPolls.has(pollId)}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className={styles.chartFootnote}>Daily breakdown of votes received</p>
    </div>
  );
}
