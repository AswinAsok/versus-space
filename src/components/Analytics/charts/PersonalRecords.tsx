import { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ChampionIcon,
  FlashIcon,
  ChartIncreaseIcon,
  Clock01Icon,
} from '@hugeicons/core-free-icons';
import { voteFacade } from '../../../core/appServices';
import type { PollWithOptions } from '../../../types';
import chartStyles from './Charts.module.css';
import styles from './PersonalRecords.module.css';

interface PersonalRecordsProps {
  polls: PollWithOptions[];
  showProBadge?: boolean;
  proDescription?: string;
  useDummyData?: boolean;
}

interface Record {
  type: string;
  icon: typeof ChampionIcon;
  title: string;
  pollTitle: string;
  value: string;
  color: string;
}

export function PersonalRecords({
  polls,
  showProBadge,
  proDescription,
  useDummyData = false,
}: PersonalRecordsProps) {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (polls.length === 0) {
      setLoading(false);
      return;
    }

    const calculateRecords = async () => {
      try {
        const pollIds = polls.map((p) => p.id);

        const pollOptions = new Map(
          polls.map((poll) => [
            poll.id,
            poll.options.map((option) => ({
              title: option.title,
              vote_count: option.vote_count,
            })),
          ])
        );

        // Calculate total votes per poll
        const pollVotes = new Map<string, number>();
        pollOptions.forEach((options, pollId) => {
          const total = options.reduce((sum, opt) => sum + opt.vote_count, 0);
          pollVotes.set(pollId, total);
        });

        // 1. Most Voted Poll
        let mostVotedPoll: PollWithOptions | null = null;
        let maxVotes = 0;
        for (const poll of polls) {
          const votes = pollVotes.get(poll.id) || 0;
          if (votes > maxVotes) {
            maxVotes = votes;
            mostVotedPoll = poll;
          }
        }

        // 2. Fastest Growing (votes in last 24h)
        const last24hVotes = useDummyData
          ? new Map<string, number>()
          : await voteFacade.getVoteCountsSince(
              pollIds,
              new Date(Date.now() - 24 * 60 * 60 * 1000)
            );

        let fastestGrowingPoll: PollWithOptions | null = null;
        let maxGrowth = 0;
        for (const poll of polls) {
          const growth = last24hVotes.get(poll.id) || 0;
          if (growth > maxGrowth) {
            maxGrowth = growth;
            fastestGrowingPoll = poll;
          }
        }

        // 3. Closest Race (smallest margin between top 2 options)
        let closestRacePoll: PollWithOptions | null = null;
        let smallestMargin = Infinity;
        let marginPercent = 0;

        for (const [pollId, options] of pollOptions) {
          if (options.length < 2) continue;
          const sorted = [...options].sort((a, b) => b.vote_count - a.vote_count);
          const total = sorted.reduce((sum, opt) => sum + opt.vote_count, 0);
          if (total === 0) continue;

          const margin = sorted[0].vote_count - sorted[1].vote_count;
          const marginPct = (margin / total) * 100;

          if (margin < smallestMargin && total > 0) {
            smallestMargin = margin;
            marginPercent = marginPct;
            closestRacePoll = polls.find((p) => p.id === pollId) || null;
          }
        }

        // 4. Most Recent Active Poll
        const recentPoll = [...polls]
          .filter((p) => p.is_active)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

        // Build records array
        const newRecords: Record[] = [];

        if (mostVotedPoll && maxVotes > 0) {
          newRecords.push({
            type: 'most_voted',
            icon: ChampionIcon,
            title: 'Most Voted',
            pollTitle: mostVotedPoll.title,
            value: `${maxVotes.toLocaleString()} votes`,
            color: '#3ecf8e',
          });
        }

        if (fastestGrowingPoll && maxGrowth > 0) {
          newRecords.push({
            type: 'fastest_growing',
            icon: FlashIcon,
            title: 'Fastest Growing',
            pollTitle: fastestGrowingPoll.title,
            value: `+${maxGrowth} in 24h`,
            color: '#3ecf8e',
          });
        }

        if (closestRacePoll && smallestMargin < Infinity) {
          newRecords.push({
            type: 'closest_race',
            icon: ChartIncreaseIcon,
            title: 'Closest Race',
            pollTitle: closestRacePoll.title,
            value: marginPercent < 1 ? 'Tie!' : `${marginPercent.toFixed(1)}% margin`,
            color: '#94a3b8',
          });
        }

        if (recentPoll) {
          const daysSinceCreation = Math.floor(
            (Date.now() - new Date(recentPoll.created_at).getTime()) / (1000 * 60 * 60 * 24)
          );
          newRecords.push({
            type: 'most_recent',
            icon: Clock01Icon,
            title: 'Latest Active',
            pollTitle: recentPoll.title,
            value: daysSinceCreation === 0 ? 'Today' : `${daysSinceCreation}d ago`,
            color: '#78716c',
          });
        }

        setRecords(newRecords);
      } catch (err) {
        console.error('Failed to calculate records:', err);
      } finally {
        setLoading(false);
      }
    };

    calculateRecords();
  }, [polls, useDummyData]);

  if (loading) {
    return (
      <div className={styles.recordsCard}>
        {proDescription && <p className={styles.proDescription}>{proDescription}</p>}
        <div className={styles.headerLeft}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>Personal Records</h3>
            {showProBadge && <span className={chartStyles.proBadge}>Pro</span>}
          </div>
        </div>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className={styles.recordsCard}>
        {proDescription && <p className={styles.proDescription}>{proDescription}</p>}
        <div className={styles.headerLeft}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>Personal Records</h3>
            {showProBadge && <span className={chartStyles.proBadge}>Pro</span>}
          </div>
        </div>
        <div className={styles.empty}>
          <p>No records yet. Create some polls to see your achievements!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.recordsCard}>
      {proDescription && <p className={styles.proDescription}>{proDescription}</p>}
      <div className={styles.headerLeft}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>Personal Records</h3>
          {showProBadge && <span className={chartStyles.proBadge}>Pro</span>}
        </div>
      </div>
      <div className={styles.recordsGrid}>
        {records.map((record, index) => (
          <div
            key={record.type}
            className={styles.recordItem}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={styles.recordIcon} style={{ color: record.color }}>
              <HugeiconsIcon icon={record.icon} size={20} />
            </div>
            <div className={styles.recordContent}>
              <span className={styles.recordType}>{record.title}</span>
              <span className={styles.recordPoll}>{record.pollTitle}</span>
              <span className={styles.recordValue} style={{ color: record.color }}>
                {record.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
