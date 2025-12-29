import { useState, useEffect, useRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ChampionIcon } from '@hugeicons/core-free-icons';
import { supabase } from '../../../lib/supabaseClient';
import type { Poll, PollOption } from '../../../types';
import styles from './OptionRace.module.css';

interface OptionRaceProps {
  polls: Poll[];
  selectedPollId: string;
  onPollChange: (pollId: string) => void;
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

export function OptionRace({ polls, selectedPollId, onPollChange }: OptionRaceProps) {
  const [options, setOptions] = useState<RaceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [leadChange, setLeadChange] = useState<string | null>(null);
  const previousLeader = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedPollId) {
      setLoading(false);
      return;
    }

    const fetchOptions = async () => {
      try {
        const { data } = await supabase
          .from('poll_options')
          .select('id, title, vote_count, position')
          .eq('poll_id', selectedPollId)
          .order('position');

        if (data) {
          const totalVotes = data.reduce((sum, opt) => sum + opt.vote_count, 0);
          const sorted = [...data].sort((a, b) => b.vote_count - a.vote_count);
          const leaderId = sorted[0]?.id;

          // Check for lead change
          if (previousLeader.current && previousLeader.current !== leaderId) {
            const newLeader = data.find((opt) => opt.id === leaderId);
            if (newLeader) {
              setLeadChange(newLeader.title);
              setTimeout(() => setLeadChange(null), 3000);
            }
          }
          previousLeader.current = leaderId;

          const raceOptions: RaceOption[] = data.map((opt, index) => ({
            id: opt.id,
            title: opt.title,
            votes: opt.vote_count,
            percentage: totalVotes > 0 ? (opt.vote_count / totalVotes) * 100 : 0,
            isLeading: opt.id === leaderId,
            color: RACE_COLORS[index % RACE_COLORS.length],
          }));

          setOptions(raceOptions);
        }
      } catch (err) {
        console.error('Failed to fetch race options:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`race-${selectedPollId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'poll_options',
          filter: `poll_id=eq.${selectedPollId}`,
        },
        () => {
          fetchOptions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedPollId]);

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
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h3 className={styles.title}>Option Race</h3>
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
                      <span className={styles.percentage}>
                        {option.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className={styles.footer}>
            <span className={styles.totalVotes}>
              {totalVotes.toLocaleString()} total votes
            </span>
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
