CREATE TABLE auth_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  emailVerified INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

CREATE TABLE auth_sessions (
  id TEXT PRIMARY KEY,
  expiresAt INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  userId TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE
);

CREATE INDEX auth_sessions_user_id_idx ON auth_sessions(userId);

CREATE TABLE auth_accounts (
  id TEXT PRIMARY KEY,
  accountId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  userId TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  accessToken TEXT,
  refreshToken TEXT,
  idToken TEXT,
  accessTokenExpiresAt INTEGER,
  refreshTokenExpiresAt INTEGER,
  scope TEXT,
  password TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

CREATE INDEX auth_accounts_user_id_idx ON auth_accounts(userId);
CREATE UNIQUE INDEX auth_accounts_provider_account_idx
  ON auth_accounts(providerId, accountId);

CREATE TABLE auth_verifications (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt INTEGER NOT NULL,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

CREATE INDEX auth_verifications_identifier_idx ON auth_verifications(identifier);

CREATE TABLE auth_rate_limits (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  count INTEGER NOT NULL,
  lastRequest INTEGER NOT NULL
);
