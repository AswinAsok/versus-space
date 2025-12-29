import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { PollVoteSummary } from '../../../types';
import styles from './Charts.module.css';

interface VotesPerPollChartProps {
  data: PollVoteSummary[];
  loading?: boolean;
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

export function VotesPerPollChart({ data, loading }: VotesPerPollChartProps) {
  // Sort by total votes descending and take top 8
  const chartData = [...data]
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .slice(0, 8)
    .map((item) => ({
      ...item,
      shortTitle: item.pollTitle.length > 15 ? item.pollTitle.slice(0, 15) + '...' : item.pollTitle,
    }));

  if (loading) {
    return (
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Total Votes by Poll</h3>
        <div className={styles.chartLoading}>
          <div className={styles.loadingSpinner} />
          <p>Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Total Votes by Poll</h3>
        <div className={styles.chartEmpty}>
          <p>No polls with votes yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>Total Votes by Poll</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
            <XAxis
              type="number"
              stroke="rgba(255,255,255,0.4)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="shortTitle"
              stroke="rgba(255,255,255,0.4)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={100}
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
              formatter={(value: number) => [value, 'Total Votes']}
              labelFormatter={(_, payload) => payload[0]?.payload?.pollTitle || ''}
            />
            <Bar dataKey="totalVotes" radius={[0, 4, 4, 0]} maxBarSize={28}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className={styles.chartFootnote}>Compares total votes across your top polls. Includes both manual and simulated votes.</p>
    </div>
  );
}
