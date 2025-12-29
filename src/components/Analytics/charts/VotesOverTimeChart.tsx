import { useMemo } from 'react';
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
import type { VoteDailyCount } from '../../../types';
import styles from './Charts.module.css';

interface VotesOverTimeChartProps {
  data: Map<string, VoteDailyCount[]>;
  pollTitles: Map<string, string>;
  loading?: boolean;
  days: number;
}

const CHART_COLORS = [
  '#3ecf8e',
  '#f5a623',
  '#6366f1',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#8b5cf6',
  '#06b6d4',
];

export function VotesOverTimeChart({ data, pollTitles, loading, days }: VotesOverTimeChartProps) {
  // Get all poll IDs
  const allPollIds = useMemo(() => Array.from(data.keys()), [data]);

  const chartData = useMemo(() => {
    // Generate all dates in the range
    const allDates: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      allDates.push(date.toISOString().split('T')[0]);
    }

    // Build chart data with all dates and all polls
    return allDates.map((date) => {
      const point: Record<string, string | number> = {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
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
        <div className={styles.chartLoading}>
          <div className={styles.loadingSpinner} />
          <p>Loading chart data...</p>
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
          <p>No manual votes in the last {days} days</p>
          <span className={styles.chartNote}>
            This chart only tracks manual votes. Simulated votes are not recorded over time.
          </span>
        </div>
      </div>
    );
  }

  // Calculate tick interval based on days
  const tickInterval = days <= 7 ? 0 : days <= 30 ? 4 : 13;

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
            />
            <Legend
              wrapperStyle={{ paddingTop: '16px' }}
              formatter={(value) => (
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                  {(pollTitles.get(value) || value).slice(0, 20)}
                  {(pollTitles.get(value) || value).length > 20 ? '...' : ''}
                </span>
              )}
            />
            {allPollIds.map((pollId, index) => (
              <Area
                key={pollId}
                type="monotone"
                dataKey={pollId}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth={2}
                fill={`url(#gradient-${pollId})`}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className={styles.chartFootnote}>Daily breakdown of manual votes received. Simulated votes are not tracked over time.</p>
    </div>
  );
}
