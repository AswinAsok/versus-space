import { useState, useEffect, useRef } from 'react';
import { voteService } from '../../services/voteService';
import { getSessionId } from '../../utils/sessionId';
import { RateCalculator } from '../../utils/rateCalculator';
import sharedStyles from '../../styles/Shared.module.css';
import type { PollOption } from '../../types';
import styles from './VotingInterface.module.css';

interface VotingInterfaceProps {
  pollId: string;
  options: PollOption[];
}

// Presents poll options, tracks vote velocity, and delegates vote persistence.
export function VotingInterface({ pollId, options }: VotingInterfaceProps) {
  const [userVotes, setUserVotes] = useState<Map<string, number>>(new Map());
  const [votingRates, setVotingRates] = useState<Map<string, number>>(new Map());
  const rateCalculatorRef = useRef(new RateCalculator());
  const sessionId = getSessionId();

  useEffect(() => {
    // Refresh vote rates on a small cadence to create the live feel.
    const interval = setInterval(() => {
      const newRates = new Map<string, number>();
      options.forEach((option) => {
        newRates.set(option.id, rateCalculatorRef.current.getRate(option.id));
      });
      setVotingRates(newRates);
    }, 100);

    return () => clearInterval(interval);
  }, [options]);

  const handleVote = async (optionId: string) => {
    try {
      await voteService.castVote(pollId, optionId, null);

      // Maintain a local sliding window rate to avoid extra network traffic.
      rateCalculatorRef.current.addVote(optionId);

      // Track what the current user has contributed for contextual feedback.
      setUserVotes((prev) => {
        const newMap = new Map(prev);
        newMap.set(optionId, (newMap.get(optionId) || 0) + 1);
        return newMap;
      });

      await voteService.updateUserSession(sessionId, pollId);
    } catch (error) {
      console.error('Failed to cast vote:', error);
    }
  };

  if (options.length === 0) {
    return <div className={sharedStyles.noOptions}>No options available</div>;
  }

  const totalVotes = options.reduce((sum, opt) => sum + opt.vote_count, 0);

  return (
    <div className={styles.votingInterface}>
      {options.map((option, index) => {
        const percentage = totalVotes > 0 ? (option.vote_count / totalVotes) * 100 : 50;
        const userVoteCount = userVotes.get(option.id) || 0;
        const rate = votingRates.get(option.id) || 0;
        const variantClass = styles[`variant${index}` as keyof typeof styles] || styles.variant0;

        return (
          <div
            key={option.id}
            className={`${styles.votingOption} ${variantClass}`}
            style={{ width: `${percentage}%` }}
          >
            {option.image_url && (
              <div className={styles.optionBackground}>
                <img src={option.image_url} alt={option.title} />
              </div>
            )}

            <div className={styles.optionContent}>
              <div className={styles.optionInfo}>
                <h2
                  className={`${styles.optionTitle} ${
                    index === 1 ? styles.darkTitle : ''
                  }`}
                >
                  {option.title}
                </h2>

                <button
                  onClick={() => handleVote(option.id)}
                  className={styles.voteButton}
                >
                  +1 {option.title}
                </button>

                <div className={styles.voteStats}>
                  <div className={styles.voteCount}>
                    <span className={styles.countLabel}>points</span>
                    <span className={styles.countNumber}>{option.vote_count.toLocaleString()}</span>
                  </div>

                  <div className={styles.voteRate}>
                    {rate.toFixed(1)} points per second
                  </div>

                  {userVoteCount > 0 && (
                    <div
                      className={`${styles.userVotes} ${index === 1 ? styles.darkDivider : ''}`}
                    >
                      You've scored {userVoteCount} points for {option.title}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
