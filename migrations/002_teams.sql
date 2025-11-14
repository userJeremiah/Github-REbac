-- Teams Schema

CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(org_id, name)
);

CREATE INDEX IF NOT EXISTS idx_teams_org_id ON teams(org_id);
