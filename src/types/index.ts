import type { Database } from './database';

export type Poll = Database['public']['Tables']['polls']['Row'];
export type PollOption = Database['public']['Tables']['poll_options']['Row'];
export type Vote = Database['public']['Tables']['votes']['Row'];
export type UserSession = Database['public']['Tables']['user_sessions']['Row'];
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

export interface PollWithOptions extends Poll {
  options: PollOption[];
  requires_access?: boolean;
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
  auto_vote_interval_seconds?: Poll['auto_vote_interval_seconds']; // Stored in milliseconds for sub-second intervals
  options: Array<
    Pick<
      PollOption,
      'title' | 'image_url' | 'position' | 'simulated_enabled' | 'simulated_target_votes'
    >
  >;
}

export interface UpdatePollData {
  title?: Poll['title'];
  is_public?: Poll['is_public'];
  access_key?: Poll['access_key'];
  ends_at?: Poll['ends_at'];
  max_votes_per_ip?: Poll['max_votes_per_ip'];
  auto_vote_interval_seconds?: Poll['auto_vote_interval_seconds']; // Stored in milliseconds for sub-second intervals
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

export interface PollVoteSummary {
  pollId: string;
  pollTitle: string;
  totalVotes: number;
}

export interface OptionVoteData {
  [key: string]: string | number;
  optionId: string;
  optionTitle: string;
  voteCount: number;
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

export interface RealtimeVoteEvent {
  pollId: string;
  optionId: string;
  optionTitle: string;
  isSimulated: boolean;
}
