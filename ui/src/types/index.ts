// User types
export interface User {
  email: string;
  firstName: string;
  lastName: string;
}

// Repository types
export interface Repository {
  id: number;
  name: string;
  orgId: number;
  visibility: 'public' | 'private';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Collaborator {
  email: string;
  role: 'read' | 'write' | 'maintain' | 'admin';
  addedAt: string;
}

// Team types
export interface Team {
  id: number;
  name: string;
  orgId: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  email: string;
  addedAt: string;
}

export interface TeamRepositoryAccess {
  repoId: number;
  repoName: string;
  role: 'read' | 'write' | 'maintain' | 'admin';
  grantedAt: string;
}

// Pull Request types
export interface PullRequest {
  id: number;
  repoId: number;
  title: string;
  description?: string;
  authorEmail: string;
  sourceBranch: string;
  targetBranch: string;
  status: 'open' | 'closed' | 'merged';
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: number;
  prId: number;
  reviewerEmail: string;
  status: 'approved' | 'changes_requested' | 'commented';
  comment?: string;
  createdAt: string;
}

// Audit Log types
export interface AuditLogEntry {
  id: number;
  userEmail: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details?: string;
  timestamp: string;
}

// Visualization types
export interface PermissionNode {
  id: string;
  type: 'user' | 'team' | 'repository';
  data: {
    label: string;
    email?: string;
    role?: string;
  };
  position: { x: number; y: number };
}

export interface PermissionEdge {
  id: string;
  source: string;
  target: string;
  type: 'direct' | 'member' | 'inherited';
  label: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
