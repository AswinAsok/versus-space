import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import styles from './Charts.module.css';

interface RealVsSimulatedChartProps {
  realVotes: number;
  simulatedVotes: number;
  loading?: boolean;
}

export function RealVsSimulatedChart({ realVotes, simulatedVotes, loading }: RealVsSimulatedChartProps) {
  const totalVotes = realVotes + simulatedVotes;
  const realPercentage = totalVotes > 0 ? ((realVotes / totalVotes) * 100).toFixed(1) : '0';
  const simulatedPercentage = totalVotes > 0 ? ((simulatedVotes / totalVotes) * 100).toFixed(1) : '0';

  const data = [
    { name: 'Real Votes', value: realVotes, color: '#3ecf8e' },
    { name: 'Simulated', value: simulatedVotes, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  if (loading) {
    return (
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Vote Authenticity</h3>
        <div className={styles.chartLoading}>
          <div className={styles.loadingSpinner} />
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  if (totalVotes === 0) {
    return (
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Vote Authenticity</h3>
        <div className={styles.chartEmpty}>
          <p>No vote data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>Vote Authenticity</h3>
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
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(20, 22, 26, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}
              formatter={(value: number, name: string) => [
                `${value.toLocaleString()} votes`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.authenticityStats}>
        <div className={styles.authStat}>
          <span className={styles.authDot} style={{ background: '#3ecf8e' }} />
          <span className={styles.authLabel}>Real</span>
          <span className={styles.authValue}>{realVotes.toLocaleString()}</span>
          <span className={styles.authPercent}>{realPercentage}%</span>
        </div>
        <div className={styles.authStat}>
          <span className={styles.authDot} style={{ background: '#94a3b8' }} />
          <span className={styles.authLabel}>Simulated</span>
          <span className={styles.authValue}>{simulatedVotes.toLocaleString()}</span>
          <span className={styles.authPercent}>{simulatedPercentage}%</span>
        </div>
      </div>

      <p className={styles.chartFootnote}>Breakdown of manually cast votes vs auto-generated simulated votes.</p>
    </div>
  );
}
