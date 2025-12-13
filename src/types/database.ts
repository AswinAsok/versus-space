export interface Database {
  public: {
    Tables: {
      polls: {
        Row: {
          id: string;
          title: string;
          creator_id: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          creator_id: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          creator_id?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      poll_options: {
        Row: {
          id: string;
          poll_id: string;
          title: string;
          image_url: string | null;
          vote_count: number;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          title: string;
          image_url?: string | null;
          vote_count?: number;
          position: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          poll_id?: string;
          title?: string;
          image_url?: string | null;
          vote_count?: number;
          position?: number;
          created_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          poll_id: string;
          option_id: string;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          option_id: string;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          poll_id?: string;
          option_id?: string;
          user_id?: string | null;
          created_at?: string;
        };
      };
      user_sessions: {
        Row: {
          id: string;
          user_id: string;
          poll_id: string;
          total_votes: number;
          last_vote_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          poll_id: string;
          total_votes?: number;
          last_vote_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          poll_id?: string;
          total_votes?: number;
          last_vote_at?: string;
          created_at?: string;
        };
      };
    };
  };
}
