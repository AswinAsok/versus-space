import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ChampionIcon,
  ArrowRight01Icon,
  ChartIncreaseIcon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { useLeaderboard } from '../../hooks/usePollQueries';
import { MouseLoader } from '../Loading/MouseLoader';
import styles from './Explore.module.css';

function getWinningInfo(
  options: { title: string; vote_count: number }[]
): { winner: string; lead: number } | null {
  if (!options || options.length < 2) return null;

  const sorted = [...options].sort((a, b) => b.vote_count - a.vote_count);
  const winner = sorted[0];
  const runnerUp = sorted[1];
  const lead = winner.vote_count - runnerUp.vote_count;

  if (winner.vote_count === 0) return null;

  return { winner: winner.title, lead };
}

export function Explore() {
  const navigate = useNavigate();
  const { data: polls, isLoading, error } = useLeaderboard(50); // Get more polls

  if (isLoading) {
    return <MouseLoader message="Loading public polls..." />;
  }

  if (error) {
    return (
      <div className={styles.exploreContainer}>
        <div className={styles.errorState}>Failed to load polls</div>
      </div>
    );
  }

  return (
    <div className={styles.exploreContainer}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Explore</h1>
        <p className={styles.subtitle}>Discover trending polls and cast your vote</p>
      </div>

      {/* Polls Grid */}
      {polls && polls.length > 0 ? (
        <div className={styles.pollsGrid}>
          {polls.map((poll, index) => {
            const winningInfo = poll.options ? getWinningInfo(poll.options) : null;

            return (
              <button
                key={poll.id}
                className={styles.pollCard}
                style={{ animationDelay: `${index * 0.03}s` }}
                onClick={() => navigate(`/poll/${poll.slug}`)}
              >
                <div className={styles.pollRank} data-rank={index + 1}>
                  {index + 1}
                </div>
                <div className={styles.pollContent}>
                  <h3 className={styles.pollTitle}>{poll.title}</h3>
                  <div className={styles.pollMeta}>
                    {poll.options && poll.options.length > 0 && (
                      <span className={styles.optionPreview}>
                        {poll.options.slice(0, 2).map((opt, i) => (
                          <span key={opt.id}>
                            {opt.title}
                            {i === 0 && poll.options.length > 1 && ' vs '}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.pollStats}>
                  {winningInfo && (
                    <span className={styles.winningInfo}>
                      <HugeiconsIcon icon={ChartIncreaseIcon} size={12} />
                      {winningInfo.winner} {winningInfo.lead > 0 ? `+${winningInfo.lead}` : ''}
                    </span>
                  )}
                  <span className={styles.voteCount}>
                    {poll.total_votes.toLocaleString()} votes
                  </span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={18} className={styles.arrow} />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <HugeiconsIcon icon={UserGroupIcon} size={48} className={styles.emptyIcon} />
          <h3>No public polls yet</h3>
          <p>Be the first to create one!</p>
        </div>
      )}
    </div>
  );
}
