import { useState, useEffect, useRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ChampionIcon } from '@hugeicons/core-free-icons';
import { pollFacade, realtimeFacade } from '../../../core/appServices';
import type { PollWithOptions } from '../../../types';
import chartStyles from './Charts.module.css';
import styles from './OptionRace.module.css';

interface OptionRaceProps {
  polls: PollWithOptions[];
  selectedPollId: string;
  onPollChange: (pollId: string) => void;
  showProBadge?: boolean;
  proDescription?: string;
  useDummyData?: boolean;
}

interface RaceOption {
  id: string;
  title: string;
  votes: number;
  percentage: number;
  isLeading: boolean;
  color: string;
}

const RACE_COLORS = [
  '#3ecf8e', // primary green
  '#94a3b8', // muted slate
  '#78716c', // warm stone
];

export function OptionRace({
  polls,
  selectedPollId,
  onPollChange,
  showProBadge,
  proDescription,
  useDummyData = false,
}: OptionRaceProps) {
  const [options, setOptions] = useState<RaceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [leadChange, setLeadChange] = useState<string | null>(null);
  const previousLeader = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedPollId) {
      setLoading(false);
      return;
    }

    const optionRows = new Map<string, { id: string; title: string; vote_count: number }>();
    const applyOptions = () => {
      const data = [...optionRows.values()];
      const totalVotes = data.reduce((sum, option) => sum + option.vote_count, 0);
      const sorted = [...data].sort((a, b) => b.vote_count - a.vote_count);
      const leaderId = sorted[0]?.id;

      if (previousLeader.current && previousLeader.current !== leaderId) {
        const newLeader = data.find((option) => option.id === leaderId);
        if (newLeader) {
          setLeadChange(newLeader.title);
          setTimeout(() => setLeadChange(null), 3000);
        }
      }
      previousLeader.current = leaderId;
      setOptions(
        data.map((option, index) => ({
          id: option.id,
          title: option.title,
          votes: option.vote_count,
          percentage: totalVotes > 0 ? (option.vote_count / totalVotes) * 100 : 0,
          isLeading: option.id === leaderId,
          color: RACE_COLORS[index % RACE_COLORS.length],
        }))
      );
    };

    const fetchOptions = async () => {
      try {
        const poll = await pollFacade.getPoll(selectedPollId);
        optionRows.clear();
        poll?.options.forEach((option) => optionRows.set(option.id, option));
        applyOptions();
      } catch (err) {
        console.error('Failed to fetch race options:', err);
      } finally {
        setLoading(false);
      }
    };

    if (useDummyData) {
      polls
        .find((poll) => poll.id === selectedPollId)
        ?.options.forEach((option) => optionRows.set(option.id, option));
      applyOptions();
      setLoading(false);
      return;
    }

    fetchOptions();

    return realtimeFacade.subscribeToPolls([selectedPollId], {
      role: 'observer',
      viewerId: `option-race-${crypto.randomUUID()}`,
      onOption: (_, option) => {
        optionRows.set(option.id, option);
        applyOptions();
      },
    });
  }, [polls, selectedPollId, useDummyData]);

  const selectedPoll = polls.find((p) => p.id === selectedPollId);
  const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

  if (loading) {
    return (
      <div className={styles.raceCard}>
        <div className={styles.header}>
          <h3 className={styles.title}>Option Race</h3>
        </div>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.raceCard}>
      {proDescription && <p className={styles.proDescription}>{proDescription}</p>}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>Option Race</h3>
            {showProBadge && <span className={chartStyles.proBadge}>Pro</span>}
          </div>
          {leadChange && (
            <div className={styles.leadChange}>
              <HugeiconsIcon icon={ChampionIcon} size={14} />
              <span>{leadChange} takes the lead!</span>
            </div>
          )}
        </div>
        <select
          className={styles.pollSelect}
          value={selectedPollId}
          onChange={(e) => onPollChange(e.target.value)}
          disabled={polls.length === 0}
        >
          {polls.map((poll) => (
            <option key={poll.id} value={poll.id}>
              {poll.title}
            </option>
          ))}
        </select>
      </div>

      {options.length === 0 ? (
        <div className={styles.empty}>
          <p>No options available</p>
        </div>
      ) : (
        <>
          <div className={styles.raceTrack}>
            {options
              .sort((a, b) => b.votes - a.votes)
              .map((option, index) => (
                <div key={option.id} className={styles.racer}>
                  <div className={styles.racerInfo}>
                    <div className={styles.racerRank}>
                      {index === 0 && option.votes > 0 ? (
                        <HugeiconsIcon icon={ChampionIcon} size={14} style={{ color: '#3ecf8e' }} />
                      ) : (
                        <span className={styles.rankNumber}>{index + 1}</span>
                      )}
                    </div>
                    <span className={styles.racerName}>{option.title}</span>
                    <span className={styles.racerVotes}>{option.votes}</span>
                  </div>
                  <div className={styles.trackContainer}>
                    <div
                      className={`${styles.progressBar} ${option.isLeading ? styles.leading : ''}`}
                      style={{
                        width: `${option.percentage}%`,
                        backgroundColor: option.color,
                      }}
                    >
                      <span className={styles.percentage}>{option.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className={styles.footer}>
            <span className={styles.totalVotes}>{totalVotes.toLocaleString()} total votes</span>
            {selectedPoll && (
              <span className={`${styles.status} ${selectedPoll.is_active ? styles.active : ''}`}>
                {selectedPoll.is_active ? 'Live' : 'Ended'}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
