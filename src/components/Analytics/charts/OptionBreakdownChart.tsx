import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import type { OptionVoteData, Poll } from '../../../types';
import styles from './Charts.module.css';

interface OptionBreakdownChartProps {
  data: OptionVoteData[];
  pollTitle: string;
  loading?: boolean;
  polls: Poll[];
  selectedPollId: string;
  onPollChange: (pollId: string) => void;
}

const CHART_COLORS = [
  '#3ecf8e', // primary green
  '#94a3b8', // muted slate
  '#78716c', // warm stone
];

export function OptionBreakdownChart({
  data,
  pollTitle,
  loading,
  polls,
  selectedPollId,
  onPollChange,
}: OptionBreakdownChartProps) {
  const totalVotes = data.reduce((sum, item) => sum + item.voteCount, 0);

  if (loading) {
    return (
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>Option Breakdown</h3>
          <select
            value={selectedPollId}
            onChange={(e) => onPollChange(e.target.value)}
            className={styles.chartDropdown}
            disabled
          >
            {polls.map((poll) => (
              <option key={poll.id} value={poll.id}>
                {poll.title}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.skeletonCircle}>
          <Skeleton circle width={150} height={150} baseColor="rgba(255,255,255,0.02)" highlightColor="rgba(255,255,255,0.05)" />
        </div>
        <div className={styles.skeletonStats}>
          <Skeleton width={80} height={16} baseColor="rgba(255,255,255,0.02)" highlightColor="rgba(255,255,255,0.05)" />
          <Skeleton width={80} height={16} baseColor="rgba(255,255,255,0.02)" highlightColor="rgba(255,255,255,0.05)" />
        </div>
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Option Breakdown</h3>
        <div className={styles.chartEmpty}>
          <p>No polls available.</p>
        </div>
      </div>
    );
  }

  if (data.length === 0 || totalVotes === 0) {
    return (
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>Option Breakdown</h3>
          <select
            value={selectedPollId}
            onChange={(e) => onPollChange(e.target.value)}
            className={styles.chartDropdown}
          >
            {polls.map((poll) => (
              <option key={poll.id} value={poll.id}>
                {poll.title}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.chartEmpty}>
          <p>No votes recorded for this poll yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>Option Breakdown</h3>
        <select
          value={selectedPollId}
          onChange={(e) => onPollChange(e.target.value)}
          className={styles.chartDropdown}
        >
          {polls.map((poll) => (
            <option key={poll.id} value={poll.id}>
              {poll.title}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={2}
              dataKey="voteCount"
              nameKey="optionTitle"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(20, 22, 26, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}
              labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: '4px' }}
              itemStyle={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}
              formatter={(value: number, name: string) => {
                const percentage = ((value / totalVotes) * 100).toFixed(1);
                return [`${value} votes (${percentage}%)`, name];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.authenticityStats}>
        {data.map((item, index) => {
          const percentage = ((item.voteCount / totalVotes) * 100).toFixed(1);
          return (
            <div key={item.optionId} className={styles.authStat}>
              <span className={styles.authDot} style={{ background: CHART_COLORS[index % CHART_COLORS.length] }} />
              <span className={styles.authLabel}>{item.optionTitle.length > 12 ? item.optionTitle.slice(0, 12) + '...' : item.optionTitle}</span>
              <span className={styles.authValue}>{item.voteCount.toLocaleString()}</span>
              <span className={styles.authPercent}>{percentage}%</span>
            </div>
          );
        })}
      </div>
      <p className={styles.chartFootnote}>Shows how votes are distributed among options for the selected poll.</p>
    </div>
  );
}
