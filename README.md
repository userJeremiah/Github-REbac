# GitHub-Style Repository Manager with Permit.io ReBAC

> Production-grade authorization system demonstrating Relationship-Based Access Control (ReBAC) using Permit.io

## 🎯 What This Demonstrates

- **Relationship-Based Access Control (ReBAC)** - Complex permissions through relationships
- **Permission Inheritance** - Users automatically gain access via team membership
- **Conditional Authorization** - Branch protection rules with multi-condition checks
- **Production Patterns** - Audit logging, permission graphs, scalable architecture

## 🏗️ Architecture

```
User → Team → Repository (Permission Inheritance)
User → Author → Pull Request (Relationship)
Branch Protection → Required Approvals (Conditional Logic)
```

### Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Database**: PostgreSQL / SQLite
- **Authorization**: Permit.io ReBAC
- **AI**: Google Gemini
- **Deployment**: Railway/Render/Fly.io

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL
- Permit.io account (free tier)

### Installation

```bash
# Clone and install
git clone <your-repo-url>
cd github-rebac-system
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials
```

### Database Setup

**Option 1: SQLite (Recommended for Development)**
```bash
# SQLite database is created automatically
# No additional setup needed
npm run dev
```

**Option 2: PostgreSQL (Production)**
```bash
# Create PostgreSQL database
createdb github_rebac

# Run migrations
psql -d github_rebac -f migrations/001_initial_schema.sql
psql -d github_rebac -f migrations/002_teams.sql
psql -d github_rebac -f migrations/003_pull_requests.sql
psql -d github_rebac -f migrations/004_audit_logs.sql
```

### Permit.io Setup

1. Go to [Permit.io Dashboard](https://app.permit.io)
2. Create a new project
3. Create these resources:

**Resource: repository**
- Actions: `read`, `write`, `maintain`, `admin`, `triage`

**Resource: team**
- Actions: `read`, `write`, `admin`
- Relations: `member`

**Resource: pull_request**
- Actions: `read`, `write`, `approve`, `merge`
- Relations: `author`

4. Copy your API key to `.env`

### Run the Application

**Option 1: Start Both Backend and UI (Recommended)**
```bash
# Windows PowerShell
.\start-dev.ps1

# This will open two terminals:
# - Backend API on http://localhost:3000
# - Frontend UI on http://localhost:5173
```

**Option 2: Start Separately**
```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd ui
npm install  # First time only
npm run dev
```

**Backend API**: `http://localhost:3000`  
**Frontend UI**: `http://localhost:5173`

### Access the UI

1. Open browser to `http://localhost:5173`
2. Login with any email (e.g., `alice@example.com`, `Alice`, `Smith`)
3. Explore repositories, teams, and more!

See [UI Quick Start Guide](./UI_QUICK_START.md) for detailed UI documentation.

## 📚 API Endpoints

### Repositories

```bash
# Create repository
POST /api/repositories
Headers: x-user-email: alice@example.com
Body: { "name": "my-api", "orgId": 1, "visibility": "private" }

# Get user's accessible repositories
GET /api/repositories
Headers: x-user-email: alice@example.com

# Get specific repository (requires read permission)
GET /api/repositories/:id
Headers: x-user-email: alice@example.com

# Update repository (requires write permission)
PATCH /api/repositories/:id
Headers: x-user-email: alice@example.com
Body: { "description": "Updated description" }

# Delete repository (requires admin permission)
DELETE /api/repositories/:id
Headers: x-user-email: alice@example.com

# Add collaborator (requires admin permission)
POST /api/repositories/:id/collaborators
Headers: x-user-email: alice@example.com
Body: { "userEmail": "bob@example.com", "role": "write" }

# Remove collaborator (requires admin permission)
DELETE /api/repositories/:id/collaborators/:userEmail
Headers: x-user-email: alice@example.com
```

### Teams

```bash
# Create team
POST /api/teams
Headers: x-user-email: alice@example.com
Body: { "name": "Backend Engineers", "orgId": 1, "description": "Backend team" }

# Add team member (requires team admin)
POST /api/teams/:id/members
Headers: x-user-email: alice@example.com
Body: { "userEmail": "bob@example.com" }

# Remove team member (requires team admin)
DELETE /api/teams/:id/members/:userEmail
Headers: x-user-email: alice@example.com

# Grant team access to repository (requires team admin)
POST /api/teams/:id/repositories
Headers: x-user-email: alice@example.com
Body: { "repoId": 1, "role": "write" }
```

### Pull Requests

```bash
# Create pull request (requires write access)
POST /api/pull-requests
Headers: x-user-email: alice@example.com
Body: {
  "repoId": 1,
  "title": "Add new feature",
  "description": "Implements user search",
  "sourceBranch": "feature/search",
  "targetBranch": "main"
}

# Approve pull request (cannot approve own PRs)
POST /api/pull-requests/:id/approve
Headers: x-user-email: bob@example.com
Body: { "comment": "LGTM!" }

# Merge pull request (requires write access + approvals)
POST /api/pull-requests/:id/merge
Headers: x-user-email: alice@example.com

# Create branch protection rule (requires admin)
POST /api/pull-requests/branch-protection
Headers: x-user-email: alice@example.com
Body: {
  "repoId": 1,
  "branchPattern": "main",
  "requiredApprovals": 2,
  "allowAdminOverride": true
}
```

## 🎓 Key Concepts

### ReBAC vs RBAC

**RBAC**: User has role → role has permissions  
**ReBAC**: User relates to resource → relationship implies permissions

### Permission Inheritance

```
Bob → member → Backend Team
Backend Team → write → API Repo
Result: Bob can write to API Repo ✅
```

Permit.io automatically resolves multi-hop relationships!

### Transitive Relationships

```
alice → member → team:backend → write → repo:api-server
Permission check: alice + write + repo:api-server = ALLOWED
```

## 🔐 Security Highlights

- All endpoints protected by Permit.io checks
- Authors can't approve own PRs (policy rule)
- Branch protection enforces approval requirements
- Audit logs track all actions

## 📊 Demo Scenarios

### Scenario 1: Team Permission Inheritance

1. Alice creates repo "api-server"
2. Alice creates team "Backend Engineers"
3. Alice grants team write access to repo
4. Alice adds Bob to team
5. **Result**: Bob automatically has write access! 🎉

### Scenario 2: Branch Protection

1. Alice protects "main" branch (requires 2 approvals)
2. Alice creates PR to main
3. Alice tries to approve own PR → ❌ DENIED
4. Bob approves PR (1/2)
5. Try to merge → ❌ DENIED (need 2)
6. Charlie approves (2/2)
7. Merge succeeds → ✅ ALLOWED

## 🚀 Deployment

### Railway

```bash
railway login
railway init
railway add postgresql
railway up
```

### Environment Variables

```
DATABASE_URL=(auto-populated by Railway)
PERMIT_API_KEY=your_key_here
PORT=3000
```

## 🤖 AI Features (NEW!)

### AI Code Reviewer
```bash
POST /api/ai/pull-requests/:id/ai-review
```
Gemini analyzes PR diffs and provides security, performance, and code quality feedback. Respects read permissions.

### PR Description Generator
```bash
POST /api/ai/generate-pr-description
```
Automatically generates professional PR descriptions from commit messages. Requires write access.

### Permission Explainer
```bash
POST /api/ai/explain-permissions
```
AI explains why you can or cannot perform specific actions. Helps users understand complex permission chains.

### Issue Triage Bot
```bash
POST /api/ai/triage-issue
```
Categorizes issues by type, priority, and suggests labels. Requires triage permission.

## 📊 Visualization & Audit

### Permission Graph
```bash
GET /api/visualization/permission-graph
```
Visualize your permission inheritance - see direct access vs team-based access.

### Audit Logs
```bash
GET /api/visualization/audit-logs
GET /api/visualization/repositories/:id/audit-logs
```
Track all actions with user, timestamp, IP address, and user agent.

## 📈 Future Enhancements

- [ ] GraphQL API for complex permission queries
- [ ] WebSocket for real-time permission updates
- [ ] React dashboard with permission visualization
- [ ] GitHub OAuth integration
- [ ] Actual git operations (merge branches)
- [ ] Notification system for PR events
- [x] ✅ AI-powered code review with Gemini
- [x] ✅ Audit logging system
- [x] ✅ Permission visualization

## 🙏 Credits

- [Permit.io](https://permit.io) - Authorization platform
- Inspired by GitHub's permission model

## 📝 License

MIT - Feel free to use for learning and portfolio projects!

---

**Built with ❤️ to master ReBAC and modern authorization patterns**
