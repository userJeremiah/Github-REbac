-- Pull Requests and Reviews Schema

CREATE TABLE IF NOT EXISTS pull_requests (
  id SERIAL PRIMARY KEY,
  repo_id INTEGER REFERENCES repositories(id) ON DELETE CASCADE,
  author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  source_branch VARCHAR(255) NOT NULL,
  target_branch VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  merged_at TIMESTAMP,
  merged_by INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  pr_id INTEGER REFERENCES pull_requests(id) ON DELETE CASCADE,
  reviewer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(pr_id, reviewer_id)
);

CREATE TABLE IF NOT EXISTS branch_protection_rules (
  id SERIAL PRIMARY KEY,
  repo_id INTEGER REFERENCES repositories(id) ON DELETE CASCADE,
  branch_pattern VARCHAR(255) NOT NULL,
  required_approvals INTEGER DEFAULT 1,
  require_status_checks BOOLEAN DEFAULT false,
  require_conversation_resolution BOOLEAN DEFAULT false,
  allow_admin_override BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prs_repo_id ON pull_requests(repo_id);
CREATE INDEX IF NOT EXISTS idx_reviews_pr_id ON reviews(pr_id);
CREATE INDEX IF NOT EXISTS idx_branch_protection_repo_id ON branch_protection_rules(repo_id);
