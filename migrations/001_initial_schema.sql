-- Initial Database Schema for GitHub ReBAC System

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS repositories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  visibility VARCHAR(20) DEFAULT 'private',
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(org_id, name)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(100),
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_repos_org_id ON repositories(org_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Insert sample users for testing
INSERT INTO users (email, name) VALUES 
  ('alice@example.com', 'Alice Admin'),
  ('bob@example.com', 'Bob Developer'),
  ('charlie@example.com', 'Charlie Reviewer')
ON CONFLICT (email) DO NOTHING;
