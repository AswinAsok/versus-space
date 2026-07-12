PRAGMA foreign_keys = ON;

CREATE TABLE user_profiles (
  user_id TEXT PRIMARY KEY NOT NULL,
  email TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'superadmin')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE polls (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  creator_id TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  is_public INTEGER NOT NULL DEFAULT 1 CHECK (is_public IN (0, 1)),
  access_key TEXT,
  ends_at TEXT,
  max_votes_per_ip INTEGER,
  auto_vote_interval_seconds INTEGER NOT NULL DEFAULT 30,
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE poll_options (
  id TEXT PRIMARY KEY NOT NULL,
  poll_id TEXT NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT,
  vote_count INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  simulated_enabled INTEGER NOT NULL DEFAULT 0 CHECK (simulated_enabled IN (0, 1)),
  simulated_target_votes INTEGER,
  simulated_votes_added INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
);

CREATE TABLE user_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  poll_id TEXT NOT NULL,
  total_votes INTEGER NOT NULL DEFAULT 0,
  last_vote_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (user_id, poll_id),
  FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
);

CREATE TABLE votes (
  id TEXT PRIMARY KEY NOT NULL,
  poll_id TEXT NOT NULL,
  option_id TEXT NOT NULL,
  user_id TEXT,
  created_at TEXT NOT NULL,
  ip_address TEXT,
  is_simulated INTEGER NOT NULL DEFAULT 0 CHECK (is_simulated IN (0, 1)),
  FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
  FOREIGN KEY (option_id) REFERENCES poll_options(id) ON DELETE CASCADE
);

CREATE INDEX idx_poll_options_poll ON poll_options(poll_id);
CREATE INDEX idx_polls_active ON polls(is_active);
CREATE INDEX idx_polls_creator ON polls(creator_id);
CREATE INDEX idx_polls_public ON polls(is_public) WHERE is_public = 1;
CREATE INDEX idx_user_sessions_poll ON user_sessions(poll_id);
CREATE INDEX idx_votes_created ON votes(poll_id, created_at);
CREATE INDEX idx_votes_option ON votes(option_id);
CREATE INDEX idx_votes_poll ON votes(poll_id);
CREATE INDEX idx_votes_poll_ip_real ON votes(poll_id, ip_address) WHERE is_simulated = 0;
CREATE INDEX user_profiles_email_idx ON user_profiles(email);
