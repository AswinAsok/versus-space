import { useState, useEffect, useCallback, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { pollFacade, voteFacade } from '../../core/appServices';
import {
  VotesOverTimeChart,
  VotesPerPollChart,
  OptionBreakdownChart,
  LiveStatsBar,
  LiveActivityFeed,
  VotingHeatmap,
  RealVsSimulatedChart,
  ActivePollsTracker,
  VoteMomentumGauge,
  PersonalRecords,
  OptionRace,
  BestTimeToPost,
  MilestoneProgress,
  PollHealthScores,
} from './charts';
import type { Poll, VoteDailyCount, PollVoteSummary, OptionVoteData } from '../../types';
import styles from './Analytics.module.css';

interface AnalyticsProps {
  user: User;
}

type DateRange = 7 | 30 | 90;

export function Analytics({ user }: AnalyticsProps) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);

  // Chart data state
  const [votesOverTime, setVotesOverTime] = useState<Map<string, VoteDailyCount[]>>(new Map());
  const [votesPerPoll, setVotesPerPoll] = useState<PollVoteSummary[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>(30);
  const [selectedPollId, setSelectedPollId] = useState<string>('');

  // New chart data
  const [voteTimestamps, setVoteTimestamps] = useState<Date[]>([]);
  const [realVotes, setRealVotes] = useState(0);
  const [simulatedVotes, setSimulatedVotes] = useState(0);

  const loadPolls = useCallback(async () => {
    try {
      const data = await pollFacade.getUserPolls(user.id);
      setPolls(data);
      if (data.length > 0 && !selectedPollId) {
        setSelectedPollId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load polls:', err);
    } finally {
      setLoading(false);
    }
  }, [user.id, selectedPollId]);

  const loadChartData = useCallback(async () => {
    if (polls.length === 0) {
      setChartsLoading(false);
      return;
    }

    setChartsLoading(true);
    try {
      const pollIds = polls.map((p) => p.id);

      const [timeData, totalData, timestamps, authStats] = await Promise.all([
        voteFacade.getVotesOverTime(pollIds, dateRange),
        voteFacade.getTotalVotesForPolls(pollIds),
        voteFacade.getVoteTimestamps(pollIds, 90), // Always fetch 90 days for heatmap
        voteFacade.getVoteAuthenticityStats(pollIds),
      ]);

      setVotesOverTime(timeData);
      setVotesPerPoll(totalData);
      setVoteTimestamps(timestamps);
      setRealVotes(authStats.realVotes);
      setSimulatedVotes(authStats.simulatedVotes);
    } catch (err) {
      console.error('Failed to load chart data:', err);
    } finally {
      setChartsLoading(false);
    }
  }, [polls, dateRange]);

  useEffect(() => {
    loadPolls();
  }, [loadPolls]);

  useEffect(() => {
    if (polls.length > 0) {
      loadChartData();
    }
  }, [polls, loadChartData]);

  // Poll titles map for chart legends
  const pollTitles = useMemo(() => {
    const map = new Map<string, string>();
    polls.forEach((poll) => map.set(poll.id, poll.title));
    return map;
  }, [polls]);

  // Option breakdown data for selected poll
  const [optionData, setOptionData] = useState<OptionVoteData[]>([]);
  const [optionLoading, setOptionLoading] = useState(false);

  useEffect(() => {
    const loadOptionData = async () => {
      if (!selectedPollId) {
        setOptionData([]);
        return;
      }

      setOptionLoading(true);
      try {
        const pollData = await pollFacade.getPoll(selectedPollId);
        if (pollData?.options) {
          setOptionData(
            pollData.options.map((opt) => ({
              optionId: opt.id,
              optionTitle: opt.title,
              voteCount: opt.vote_count,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load option data:', err);
      } finally {
        setOptionLoading(false);
      }
    };

    loadOptionData();
  }, [selectedPollId]);

  const selectedPollTitle = polls.find((p) => p.id === selectedPollId)?.title || '';
  const totalVotes = votesPerPoll.reduce((sum, p) => sum + p.totalVotes, 0);
  const activePolls = polls.filter((p) => p.is_active).length;
  const pollIds = polls.map((p) => p.id);

  if (loading) {
    return (
      <div className={styles.analyticsContainer}>
        <div className={styles.analyticsInner}>
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.analyticsContainer}>
      <div className={styles.analyticsInner}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Analytics</h1>
          <p className={styles.pageSubtitle}>Real-time insights into your poll performance</p>
        </div>

        {/* Live Stats Bar */}
        <section className={styles.section}>
          <LiveStatsBar
            userId={user.id}
            totalVotes={totalVotes}
            activePolls={activePolls}
            pollIds={pollIds}
          />
        </section>

        {/* Row 0: Momentum + Milestone + Personal Records */}
        <div className={styles.threeColumnGrid}>
          <VoteMomentumGauge pollIds={pollIds} />
          <MilestoneProgress totalVotes={totalVotes} />
          <PersonalRecords polls={polls} />
        </div>

        {/* Votes Over Time Chart - Full Width Hero */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Manual Votes Over Time</h2>
            <div className={styles.dateRangeSelector}>
              {([7, 30, 90] as DateRange[]).map((days) => (
                <button
                  key={days}
                  className={`${styles.dateRangeButton} ${dateRange === days ? styles.dateRangeActive : ''}`}
                  onClick={() => setDateRange(days)}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>
          <VotesOverTimeChart
            data={votesOverTime}
            pollTitles={pollTitles}
            loading={chartsLoading}
            days={dateRange}
          />
        </section>

        {/* Row 1: Option Race + Poll Health Scores */}
        <div className={styles.twoColumnGrid}>
          <OptionRace
            polls={polls}
            selectedPollId={selectedPollId}
            onPollChange={setSelectedPollId}
          />
          <PollHealthScores polls={polls} />
        </div>

        {/* Row 2: Best Time to Post + Active Polls Tracker */}
        <div className={styles.twoColumnGrid}>
          <BestTimeToPost pollIds={pollIds} />
          <ActivePollsTracker polls={polls} />
        </div>

        {/* Row 3: Live Activity Feed + Voting Heatmap */}
        <div className={styles.twoColumnGrid}>
          <LiveActivityFeed pollIds={pollIds} pollTitles={pollTitles} />
          <VotingHeatmap voteTimestamps={voteTimestamps} loading={chartsLoading} />
        </div>

        {/* Row 4: Vote Authenticity + Votes by Poll */}
        <div className={styles.twoColumnGrid}>
          <RealVsSimulatedChart
            realVotes={realVotes}
            simulatedVotes={simulatedVotes}
            loading={chartsLoading}
          />
          <VotesPerPollChart data={votesPerPoll} loading={chartsLoading} />
        </div>

        {/* Row 5: Option Breakdown - Full Width */}
        <section className={styles.section}>
          <OptionBreakdownChart
            data={optionData}
            pollTitle={selectedPollTitle}
            loading={optionLoading}
            polls={polls}
            selectedPollId={selectedPollId}
            onPollChange={setSelectedPollId}
          />
        </section>
      </div>
    </div>
  );
}
