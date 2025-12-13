export interface Poll {
  id: string;
  title: string;
  creator_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PollOption {
  id: string;
  poll_id: string;
  title: string;
  image_url: string | null;
  vote_count: number;
  position: number;
  created_at: string;
}

export interface Vote {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string | null;
  created_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  poll_id: string;
  total_votes: number;
  last_vote_at: string;
  created_at: string;
}

export interface PollWithOptions extends Poll {
  options: PollOption[];
}

export interface CreatePollData {
  title: string;
  options: {
    title: string;
    image_url: string | null;
    position: number;
  }[];
}
