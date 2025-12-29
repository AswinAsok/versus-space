import { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Activity01Icon, CheckmarkCircle02Icon, AlertCircleIcon } from '@hugeicons/core-free-icons';
import { supabase } from '../../../lib/supabaseClient';
import type { Poll, PollHealthScore } from '../../../types';
import styles from './PollHealthScores.module.css';

interface PollHealthScoresProps {
  polls: Poll[];
}

export function PollHealthScores({ polls }: PollHealthScoresProps) {
  const [scores, setScores] = useState<PollHealthScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (polls.length === 0) {
      setLoading(false);
      return;
    }

    const calculateScores = async () => {
      try {
        const pollIds = polls.map((p) => p.id);

        // Fetch all options for vote counts
        const { data: allOptions } = await supabase
          .from('poll_options')
          .select('poll_id, vote_count')
          .in('poll_id', pollIds);

        // Fetch recent votes for velocity calculation (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { data: recentVotes } = await supabase
          .from('votes')
          .select('poll_id, created_at')
          .in('poll_id', pollIds)
          .gte('created_at', sevenDaysAgo);

        // Group data by poll
        const pollOptionsMap = new Map<string, number[]>();
        allOptions?.forEach((opt) => {
          if (!pollOptionsMap.has(opt.poll_id)) {
            pollOptionsMap.set(opt.poll_id, []);
          }
          pollOptionsMap.get(opt.poll_id)!.push(opt.vote_count);
        });

        const pollVelocityMap = new Map<string, number>();
        recentVotes?.forEach((vote) => {
          pollVelocityMap.set(vote.poll_id, (pollVelocityMap.get(vote.poll_id) || 0) + 1);
        });

        // Calculate health scores
        const healthScores: PollHealthScore[] = polls.map((poll) => {
          const optionVotes = pollOptionsMap.get(poll.id) || [];
          const totalVotes = optionVotes.reduce((sum, v) => sum + v, 0);
          const recentVoteCount = pollVelocityMap.get(poll.id) || 0;
          const velocity = recentVoteCount / 7; // votes per day

          // Calculate balance score (how evenly distributed are votes)
          let balanceScore = 0;
          if (optionVotes.length >= 2 && totalVotes > 0) {
            const sorted = [...optionVotes].sort((a, b) => b - a);
            const topTwoRatio = sorted[1] / (sorted[0] || 1);
            balanceScore = topTwoRatio * 100; // 0-100, higher is more balanced
          }

          // Calculate engagement score based on total votes
          const engagementScore = Math.min(totalVotes / 10, 100); // 100 votes = max engagement score

          // Calculate velocity score
          const velocityScore = Math.min(velocity * 10, 100); // 10 votes/day = max velocity score

          // Composite score (weighted average)
          const score = Math.round(
            engagementScore * 0.4 + balanceScore * 0.3 + velocityScore * 0.3
          );

          // Determine labels
          const engagement: 'low' | 'medium' | 'high' =
            engagementScore < 30 ? 'low' : engagementScore < 70 ? 'medium' : 'high';

          const balance: 'poor' | 'good' | 'perfect' =
            balanceScore < 40 ? 'poor' : balanceScore < 80 ? 'good' : 'perfect';

          return {
            pollId: poll.id,
            pollTitle: poll.title,
            score,
            engagement,
            balance,
            velocity,
            isActive: poll.is_active,
          };
        });

        // Sort by score descending
        healthScores.sort((a, b) => b.score - a.score);
        setScores(healthScores);
      } catch (err) {
        console.error('Failed to calculate health scores:', err);
      } finally {
        setLoading(false);
      }
    };

    calculateScores();
  }, [polls]);

  const getScoreColor = (score: number): string => {
    if (score >= 70) return '#3ecf8e';
    if (score >= 40) return '#94a3b8';
    return '#78716c';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 70) return CheckmarkCircle02Icon;
    if (score >= 40) return Activity01Icon;
    return AlertCircleIcon;
  };

  if (loading) {
    return (
      <div className={styles.card}>
        <h3 className={styles.title}>Poll Health Scores</h3>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
        </div>
      </div>
    );
  }

  if (scores.length === 0) {
    return (
      <div className={styles.card}>
        <h3 className={styles.title}>Poll Health Scores</h3>
        <div className={styles.empty}>
          <p>No polls to analyze</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Poll Health Scores</h3>
        <span className={styles.subtitle}>Based on engagement, balance & velocity</span>
      </div>

      <div className={styles.scoresList}>
        {scores.slice(0, 5).map((poll, index) => (
          <div
            key={poll.pollId}
            className={styles.scoreItem}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className={styles.scoreLeft}>
              <div
                className={styles.scoreIcon}
                style={{ color: getScoreColor(poll.score) }}
              >
                <HugeiconsIcon icon={getScoreIcon(poll.score)} size={14} />
              </div>
              <div className={styles.scoreInfo}>
                <span className={styles.pollTitle}>{poll.pollTitle}</span>
                <div className={styles.metrics}>
                  <span className={`${styles.metric} ${styles[poll.engagement]}`}>
                    {poll.engagement}
                  </span>
                  <span className={styles.metricDot}>·</span>
                  <span className={`${styles.metric} ${styles[poll.balance]}`}>
                    {poll.balance}
                  </span>
                  <span className={styles.metricDot}>·</span>
                  <span className={styles.metric}>
                    {poll.velocity.toFixed(1)}/day
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.scoreRight}>
              <div className={styles.scoreBar}>
                <div
                  className={styles.scoreProgress}
                  style={{
                    width: `${poll.score}%`,
                    backgroundColor: getScoreColor(poll.score),
                  }}
                />
              </div>
              <span
                className={styles.scoreValue}
                style={{ color: getScoreColor(poll.score) }}
              >
                {poll.score}
              </span>
            </div>
          </div>
        ))}
      </div>

      {scores.length > 5 && (
        <p className={styles.moreCount}>
          +{scores.length - 5} more polls
        </p>
      )}
    </div>
  );
}
