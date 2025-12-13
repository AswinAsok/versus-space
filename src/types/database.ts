export interface Database {
  public: {
    Tables: {
      polls: {
        Row: {
          id: string;
          title: string;
          creator_id: string;
          is_active: boolean;
          is_public: boolean;
          access_key: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          creator_id: string;
          is_public: boolean;
          access_key?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          creator_id?: string;
          is_public?: boolean;
          access_key?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };
    };
    Views: {
      public_poll_leaderboard: {
        Row: {
          id: string;
          title: string;
          creator_id: string;
          is_active: boolean;
          is_public: boolean;
          access_key: string | null;
          created_at: string;
          updated_at: string;
          total_votes: number;
          options: {
            id: string;
            title: string;
            vote_count: number;
            position: number;
          }[];
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Functions: {
      increment_user_session_votes: {
        Args: {
          p_user_id: string;
          p_poll_id: string;
        };
        Returns: unknown;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
