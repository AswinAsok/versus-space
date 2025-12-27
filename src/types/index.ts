import type { Database } from './database';

export type Poll = Database['public']['Tables']['polls']['Row'];
export type PollOption = Database['public']['Tables']['poll_options']['Row'];
export type Vote = Database['public']['Tables']['votes']['Row'];
export type UserSession = Database['public']['Tables']['user_sessions']['Row'];

export interface PollWithOptions extends Poll {
  options: PollOption[];
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

export type LeaderboardPoll = Database['public']['Views']['public_poll_leaderboard']['Row'];
