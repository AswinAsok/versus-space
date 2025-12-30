import { useState, useEffect, useCallback, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { pollFacade, voteFacade } from '../../core/appServices';
import { useUserProfile } from '../../hooks/useUserProfile';
import {
  VotesOverTimeChart,
  VotesPerPollChart,
  OptionBreakdownChart,
  LiveStatsBar,
  VotingHeatmap,
  RealVsSimulatedChart,
  ActivePollsTracker,
  VoteMomentumGauge,
  PersonalRecords,
  OptionRace,
  MilestoneProgress,
  PollHealthScores,
} from './charts';
import { VoteToast } from './VoteToast';
import type { Poll, VoteDailyCount, PollVoteSummary, OptionVoteData } from '../../types';
import styles from './Analytics.module.css';

interface AnalyticsProps {
  user: User;
}

type DateRange = 1 | 3 | 7 | 30 | 90;

export function Analytics({ user }: AnalyticsProps) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);

  // Check Pro status
  const { data: profile } = useUserProfile(user);
  const isSuperAdmin = profile?.role === 'superadmin';
  const isPro = isSuperAdmin || profile?.plan === 'pro';

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
        voteFacade.getVoteTimestamps(pollIds, 365), // Fetch 365 days for heatmap
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
    } else if (!loading) {
      // No polls, so no chart data to load - stop showing loading state
      setChartsLoading(false);
    }
  }, [polls, loading, loadChartData]);

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

  // Check if we should show dummy data
  // Non-Pro users always see dummy data (Analytics is a Pro feature)
  // Pro users with no polls also see dummy data
  const useDummyData = !isPro || polls.length === 0;

  // Simulated real-time dummy data state
  const [dummyTotalVotesState, setDummyTotalVotesState] = useState(211);
  const [dummyOptionDataState, setDummyOptionDataState] = useState<OptionVoteData[]>([
    { optionId: 'opt-1', optionTitle: 'Option A', voteCount: 65 },
    { optionId: 'opt-2', optionTitle: 'Option B', voteCount: 48 },
  ]);
  const [dummyVotesPerPollState, setDummyVotesPerPollState] = useState<PollVoteSummary[]>([
    { pollId: 'demo-1', pollTitle: 'Sample Poll 1', totalVotes: 127 },
    { pollId: 'demo-2', pollTitle: 'Sample Poll 2', totalVotes: 84 },
  ]);

  // Simulate real-time updates for dummy data
  useEffect(() => {
    if (!useDummyData) return;

    const interval = setInterval(() => {
      // Random chance to add a vote (30% chance every 2 seconds)
      if (Math.random() < 0.3) {
        // Increment total votes
        setDummyTotalVotesState(prev => prev + 1);

        // Randomly pick which option gets the vote
        const optionIndex = Math.random() < 0.55 ? 0 : 1;
        setDummyOptionDataState(prev => prev.map((opt, idx) =>
          idx === optionIndex ? { ...opt, voteCount: opt.voteCount + 1 } : opt
        ));

        // Randomly pick which poll gets the vote
        const pollIndex = Math.random() < 0.6 ? 0 : 1;
        setDummyVotesPerPollState(prev => prev.map((poll, idx) =>
          idx === pollIndex ? { ...poll, totalVotes: poll.totalVotes + 1 } : poll
        ));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [useDummyData]);

  // Dummy data for empty state or free tier
  const dummyPolls: Poll[] = useDummyData ? [
    {
      id: 'demo-1',
      title: 'Sample Poll 1',
      slug: 'sample-poll-1',
      is_public: true,
      is_active: true,
      created_at: new Date().toISOString(),
      user_id: user.id,
    },
    {
      id: 'demo-2',
      title: 'Sample Poll 2',
      slug: 'sample-poll-2',
      is_public: true,
      is_active: false,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      user_id: user.id,
    },
  ] : polls;

  const dummyVotesPerPoll: PollVoteSummary[] = useDummyData ? dummyVotesPerPollState : votesPerPoll;

  const dummyVotesOverTime = useDummyData ? (() => {
    const map = new Map<string, VoteDailyCount[]>();
    const today = new Date();
    const data: VoteDailyCount[] = [];
    for (let i = dateRange - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      data.push({ date: dateStr, count: Math.floor(Math.random() * 20) + 5 });
    }
    map.set('demo-1', data);
    map.set('demo-2', data.map(d => ({ ...d, count: Math.floor(d.count * 0.7) })));
    return map;
  })() : votesOverTime;

  const dummyPollTitles = useDummyData ? new Map([
    ['demo-1', 'Sample Poll 1'],
    ['demo-2', 'Sample Poll 2'],
  ]) : pollTitles;

  const dummyOptionData: OptionVoteData[] = useDummyData ? dummyOptionDataState : optionData;

  const dummyVoteTimestamps = useDummyData ? (() => {
    const timestamps: Date[] = [];
    const now = Date.now();
    for (let i = 0; i < 50; i++) {
      timestamps.push(new Date(now - Math.random() * 30 * 24 * 60 * 60 * 1000));
    }
    return timestamps;
  })() : voteTimestamps;

  const dummyTotalVotes = useDummyData ? dummyTotalVotesState : totalVotes;
  const dummyActivePolls = useDummyData ? 1 : activePolls;
  const dummyPollIds = useDummyData ? ['demo-1', 'demo-2'] : pollIds;
  const dummyRealVotes = useDummyData ? dummyTotalVotesState : realVotes;
  const dummySimulatedVotes = useDummyData ? 0 : simulatedVotes;

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

        {/* Live Stats Bar - Always visible */}
        <LiveStatsBar
          userId={user.id}
          totalVotes={dummyTotalVotes}
          activePolls={dummyActivePolls}
          pollIds={dummyPollIds}
          showSampleNote={useDummyData}
          sampleNoteMessage={!isPro
            ? 'Showing sample data — upgrade to Pro for real analytics'
            : 'Showing sample data — create your first poll to see real analytics'}
        />

        {/* Real-time Section: Momentum + Option Race */}
        <div className={styles.twoColumnGrid}>
          <div className={styles.proWrapper}>
            <div className={!isPro ? styles.proContent : ''}>
              <VoteMomentumGauge
                pollIds={dummyPollIds}
                showProBadge={!isPro}
                proDescription={!isPro ? 'Track voting momentum in real-time' : undefined}
              />
            </div>
          </div>
          <div className={styles.proWrapper}>
            <div className={!isPro ? styles.proContent : ''}>
              <OptionRace
                polls={dummyPolls}
                selectedPollId={useDummyData ? 'demo-1' : selectedPollId}
                onPollChange={useDummyData ? () => {} : setSelectedPollId}
                showProBadge={!isPro}
                proDescription={!isPro ? 'Watch options compete live' : undefined}
              />
            </div>
          </div>
        </div>

        {/* Vote Toast Notifications */}
        {!useDummyData && isPro && <VoteToast pollIds={pollIds} pollTitles={pollTitles} />}

        {/* Progress Section: Milestone + Personal Records */}
        <div className={styles.twoColumnGrid}>
          <div className={styles.proWrapper}>
            <div className={!isPro ? styles.proContent : ''}>
              <MilestoneProgress
                totalVotes={dummyTotalVotes}
                loading={chartsLoading && !useDummyData}
                showProBadge={!isPro}
                proDescription={!isPro ? 'Celebrate your voting milestones' : undefined}
              />
            </div>
          </div>
          <div className={styles.proWrapper}>
            <div className={!isPro ? styles.proContent : ''}>
              <PersonalRecords
                polls={dummyPolls}
                showProBadge={!isPro}
                proDescription={!isPro ? 'See your best performing polls' : undefined}
              />
            </div>
          </div>
        </div>

        {/* Votes Over Time Chart - Full Width */}
        <div className={!isPro ? styles.proContent : ''}>
          <VotesOverTimeChart
            data={dummyVotesOverTime}
            pollTitles={dummyPollTitles}
            loading={chartsLoading && !useDummyData}
            days={dateRange}
            showProBadge={!isPro}
            proDescription={!isPro ? 'Analyze voting trends over time' : undefined}
            onDateRangeChange={setDateRange}
            isPro={isPro}
          />
        </div>

        {/* Vote Activity Heatmap - Full Width */}
        <div className={!isPro ? styles.proContent : ''}>
          <VotingHeatmap
            voteTimestamps={dummyVoteTimestamps}
            totalVotesAllPolls={dummyTotalVotes}
            loading={chartsLoading && !useDummyData}
            showProBadge={!isPro}
            proDescription={!isPro ? 'Discover peak voting hours' : undefined}
          />
        </div>

        {/* Poll Health Scores - Full Width */}
        <div className={!isPro ? styles.proContent : ''}>
          <PollHealthScores
            polls={dummyPolls}
            showProBadge={!isPro}
            proDescription={!isPro ? 'Monitor poll engagement health' : undefined}
          />
        </div>

        {/* Active Polls + Vote Authenticity + Option Breakdown */}
        <div className={styles.threeColumnGrid}>
          <div className={styles.proWrapper}>
            <div className={!isPro ? styles.proContent : ''}>
              <ActivePollsTracker
                polls={dummyPolls}
                showProBadge={!isPro}
                proDescription={!isPro ? 'Track all your active polls' : undefined}
              />
            </div>
          </div>
          <div className={styles.proWrapper}>
            <div className={!isPro ? styles.proContent : ''}>
              <RealVsSimulatedChart
                realVotes={dummyRealVotes}
                simulatedVotes={dummySimulatedVotes}
                loading={chartsLoading && !useDummyData}
                showProBadge={!isPro}
                proDescription={!isPro ? 'Verify vote authenticity' : undefined}
              />
            </div>
          </div>
          <div className={styles.proWrapper}>
            <div className={!isPro ? styles.proContent : ''}>
              <OptionBreakdownChart
                data={dummyOptionData}
                pollTitle={useDummyData ? 'Sample Poll 1' : selectedPollTitle}
                loading={optionLoading && !useDummyData}
                polls={dummyPolls}
                selectedPollId={useDummyData ? 'demo-1' : selectedPollId}
                onPollChange={useDummyData ? () => {} : setSelectedPollId}
                showProBadge={!isPro}
                proDescription={!isPro ? 'Deep dive into option stats' : undefined}
              />
            </div>
          </div>
        </div>

        {/* Total Votes by Poll - Full Width */}
        <div className={!isPro ? styles.proContent : ''}>
          <VotesPerPollChart
            data={dummyVotesPerPoll}
            loading={chartsLoading && !useDummyData}
            showProBadge={!isPro}
            proDescription={!isPro ? 'Compare performance across polls' : undefined}
          />
        </div>
      </div>
    </div>
  );
}
