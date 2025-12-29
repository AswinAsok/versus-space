import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
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
  '#3ecf8e',
  '#f5a623',
  '#6366f1',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#8b5cf6',
  '#06b6d4',
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
        <div className={styles.chartLoading}>
          <div className={styles.loadingSpinner} />
          <p>Loading chart data...</p>
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
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
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
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{ paddingLeft: '20px' }}
              formatter={(value) => (
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                  {value.length > 18 ? value.slice(0, 18) + '...' : value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.totalVotes}>
        <span className={styles.totalVotesValue}>{totalVotes}</span>
        <span className={styles.totalVotesLabel}>Total Votes</span>
      </div>
      <p className={styles.chartFootnote}>Shows how votes are distributed among options for the selected poll.</p>
    </div>
  );
}
