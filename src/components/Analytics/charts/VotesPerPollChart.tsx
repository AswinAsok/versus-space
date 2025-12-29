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
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import type { PollVoteSummary } from '../../../types';
import styles from './Charts.module.css';

interface VotesPerPollChartProps {
  data: PollVoteSummary[];
  loading?: boolean;
}

const CHART_COLORS = [
  '#3ecf8e', // primary green
  '#94a3b8', // muted slate
  '#78716c', // warm stone
];

export function VotesPerPollChart({ data, loading }: VotesPerPollChartProps) {
  // Sort by total votes descending and take top 8
  const chartData = [...data]
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .slice(0, 8)
    .map((item) => ({
      ...item,
      shortTitle: item.pollTitle.length > 35 ? item.pollTitle.slice(0, 35) + '...' : item.pollTitle,
    }));

  if (loading) {
    return (
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Total Votes by Poll</h3>
        <div className={styles.skeletonWrapper}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className={styles.skeletonRow}>
              <Skeleton width={180} height={14} baseColor="rgba(255,255,255,0.02)" highlightColor="rgba(255,255,255,0.05)" />
              <Skeleton height={28} containerClassName={styles.skeletonBar} baseColor="rgba(255,255,255,0.02)" highlightColor="rgba(255,255,255,0.05)" />
            </div>
          ))}
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
        <ResponsiveContainer width="100%" height={Math.max(350, chartData.length * 50)}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
            <XAxis
              type="number"
              stroke="rgba(255,255,255,0.5)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <YAxis
              type="category"
              dataKey="shortTitle"
              stroke="rgba(255,255,255,0.7)"
              fontSize={13}
              fontWeight={500}
              tickLine={false}
              axisLine={false}
              width={220}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              contentStyle={{
                backgroundColor: 'rgba(20, 22, 26, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}
              labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: '4px' }}
              itemStyle={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}
              formatter={(value: number) => [value.toLocaleString(), 'Total Votes']}
              labelFormatter={(_, payload) => payload[0]?.payload?.pollTitle || ''}
            />
            <Bar dataKey="totalVotes" radius={[0, 6, 6, 0]} maxBarSize={36}>
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
