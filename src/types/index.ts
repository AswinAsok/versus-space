import type { Database } from './database';

export type Poll = Database['public']['Tables']['polls']['Row'];
export type PollOption = Database['public']['Tables']['poll_options']['Row'];
export type Vote = Database['public']['Tables']['votes']['Row'];
export type UserSession = Database['public']['Tables']['user_sessions']['Row'];

export interface PollWithOptions extends Poll {
  options: PollOption[];
}

export interface PlatformStats {
  pollsCount: number;
  votesCount: number;
}

export interface CreatePollData {
  title: Poll['title'];
  is_public: Poll['is_public'];
  access_key?: Poll['access_key'];
  ends_at?: Poll['ends_at'];
  max_votes_per_ip?: Poll['max_votes_per_ip'];
  auto_vote_interval_seconds?: Poll['auto_vote_interval_seconds'];
  options: Array<
    Pick<PollOption, 'title' | 'image_url' | 'position' | 'simulated_enabled' | 'simulated_target_votes'>
  >;
}

export interface UpdatePollData {
  title?: Poll['title'];
  is_public?: Poll['is_public'];
  access_key?: Poll['access_key'];
  ends_at?: Poll['ends_at'];
  max_votes_per_ip?: Poll['max_votes_per_ip'];
  auto_vote_interval_seconds?: Poll['auto_vote_interval_seconds'];
  options?: Array<{
    id?: string;
    title: string;
    image_url?: string | null;
    position: number;
    simulated_enabled?: boolean;
    simulated_target_votes?: number | null;
  }>;
}

export type LeaderboardPoll = Database['public']['Views']['public_poll_leaderboard']['Row'];

// Analytics types
export interface VoteDailyCount {
  date: string;
  count: number;
}

export interface PollVoteTimeSeries {
  pollId: string;
  pollTitle: string;
  data: VoteDailyCount[];
}

export interface PollVoteSummary {
  pollId: string;
  pollTitle: string;
  totalVotes: number;
}

export interface OptionVoteData {
  optionId: string;
  optionTitle: string;
  voteCount: number;
}

export interface AnalyticsStats {
  totalPolls: number;
  activePolls: number;
  publicPolls: number;
  totalVotes: number;
  avgVotesPerPoll: number;
}

// New analytics types
export interface VoteMomentum {
  currentHourVotes: number;
  averageHourlyVotes: number;
  isHot: boolean;
  trend: 'up' | 'down' | 'stable';
}

export interface PersonalRecord {
  type: 'most_voted' | 'fastest_growing' | 'closest_race' | 'most_recent';
  pollId: string;
  pollTitle: string;
  value: number;
  label: string;
}

export interface OptionRaceData {
  pollId: string;
  pollTitle: string;
  options: {
    id: string;
    title: string;
    votes: number;
    percentage: number;
    isLeading: boolean;
  }[];
  totalVotes: number;
}

export interface HourlyVotePattern {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  hour: number; // 0-23
  voteCount: number;
}

export interface MilestoneProgress {
  currentTotal: number;
  nextMilestone: number;
  previousMilestone: number;
  progress: number; // 0-100
  votesToNext: number;
}

export interface PollHealthScore {
  pollId: string;
  pollTitle: string;
  score: number; // 0-100
  engagement: 'low' | 'medium' | 'high';
  balance: 'poor' | 'good' | 'perfect';
  velocity: number; // votes per day
  isActive: boolean;
}
