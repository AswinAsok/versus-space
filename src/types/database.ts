export interface Database {
  public: {
    Tables: {
      polls: {
        Row: {
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
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          creator_id: string;
          is_public: boolean;
          access_key?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          ends_at?: string | null;
          max_votes_per_ip?: number | null;
          auto_vote_interval_seconds?: number;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          creator_id?: string;
          is_public?: boolean;
          access_key?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          ends_at?: string | null;
          max_votes_per_ip?: number | null;
          auto_vote_interval_seconds?: number;
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
          simulated_enabled: boolean;
          simulated_target_votes: number | null;
          simulated_votes_added: number;
        };
        Insert: {
          id?: string;
          poll_id: string;
          title: string;
          image_url?: string | null;
          vote_count?: number;
          position: number;
          created_at?: string;
          simulated_enabled?: boolean;
          simulated_target_votes?: number | null;
          simulated_votes_added?: number;
        };
        Update: {
          id?: string;
          poll_id?: string;
          title?: string;
          image_url?: string | null;
          vote_count?: number;
          position?: number;
          created_at?: string;
          simulated_enabled?: boolean;
          simulated_target_votes?: number | null;
          simulated_votes_added?: number;
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
          ip_address: string | null;
          is_simulated: boolean;
        };
        Insert: {
          id?: string;
          poll_id: string;
          option_id: string;
          user_id?: string | null;
          created_at?: string;
          ip_address?: string | null;
          is_simulated?: boolean;
        };
        Update: {
          id?: string;
          poll_id?: string;
          option_id?: string;
          user_id?: string | null;
          created_at?: string;
          ip_address?: string | null;
          is_simulated?: boolean;
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
      user_profiles: {
        Row: {
          user_id: string;
          email: string | null;
          plan: 'free' | 'pro';
          role: 'user' | 'superadmin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          email?: string | null;
          plan?: 'free' | 'pro';
          role?: 'user' | 'superadmin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          email?: string | null;
          plan?: 'free' | 'pro';
          role?: 'user' | 'superadmin';
          created_at?: string;
          updated_at?: string;
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
      cast_vote_with_limits: {
        Args: {
          p_poll_id: string;
          p_option_id: string;
          p_user_id: string | null;
          p_ip_address: string;
        };
        Returns: void;
      };
      perform_auto_votes: {
        Args: Record<PropertyKey, never>;
        Returns: void;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
