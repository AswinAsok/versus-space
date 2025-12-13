import { useState, useEffect, useRef } from 'react';
import { voteService } from '../../services/voteService';
import { getSessionId } from '../../utils/sessionId';
import { RateCalculator } from '../../utils/rateCalculator';
import type { PollOption } from '../../types';

interface VotingInterfaceProps {
  pollId: string;
  options: PollOption[];
}

export function VotingInterface({ pollId, options }: VotingInterfaceProps) {
  const [userVotes, setUserVotes] = useState<Map<string, number>>(new Map());
  const [votingRates, setVotingRates] = useState<Map<string, number>>(new Map());
  const rateCalculatorRef = useRef(new RateCalculator());
  const sessionId = getSessionId();

  useEffect(() => {
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

      rateCalculatorRef.current.addVote(optionId);

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
    return <div className="no-options">No options available</div>;
  }

  const totalVotes = options.reduce((sum, opt) => sum + opt.vote_count, 0);

  return (
    <div className="voting-interface">
      {options.map((option, index) => {
        const percentage = totalVotes > 0 ? (option.vote_count / totalVotes) * 100 : 50;
        const userVoteCount = userVotes.get(option.id) || 0;
        const rate = votingRates.get(option.id) || 0;

        return (
          <div
            key={option.id}
            className={`voting-option voting-option-${index}`}
            style={{ width: `${percentage}%` }}
          >
            {option.image_url && (
              <div className="option-background">
                <img src={option.image_url} alt={option.title} />
              </div>
            )}

            <div className="option-content">
              <div className="option-info">
                <h2 className="option-title">{option.title}</h2>

                <button
                  onClick={() => handleVote(option.id)}
                  className="vote-button"
                >
                  +1 {option.title}
                </button>

                <div className="vote-stats">
                  <div className="vote-count">
                    <span className="count-label">points</span>
                    <span className="count-number">{option.vote_count.toLocaleString()}</span>
                  </div>

                  <div className="vote-rate">
                    {rate.toFixed(1)} points per second
                  </div>

                  {userVoteCount > 0 && (
                    <div className="user-votes">
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
