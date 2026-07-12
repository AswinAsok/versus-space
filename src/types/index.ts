export interface Poll {
  id: string;
  title: string;
  slug: string;
  creator_id: string;
  is_active: boolean;
  is_public: boolean;
  access_key: string | null;
  created_at: string;
  updated_at: string;
  ends_at: string | null;
  max_votes_per_ip: number | null;
  auto_vote_interval_seconds: number;
}

export interface PollOption {
  id: string;
  poll_id: string;
  title: string;
  image_url: string | null;
  vote_count: number;
  position: number;
  created_at: string;
  simulated_enabled: boolean;
  simulated_target_votes: number | null;
  simulated_votes_added: number;
}

export interface UserProfile {
  user_id: string;
  email: string | null;
  plan: 'free' | 'pro';
  role: 'user' | 'superadmin';
  created_at: string;
  updated_at: string;
}

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

export interface LeaderboardPoll extends Poll {
  total_votes: number;
  options: Array<Pick<PollOption, 'id' | 'title' | 'vote_count' | 'position'>>;
}

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
