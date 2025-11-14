import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { permit } from '../config/permit';
import { pool } from '../config/database';

export async function getUserPermissionGraph(req: AuthRequest, res: Response) {
  try {
    const user = req.user!;
    
    // Get all repositories
    const reposResult = await pool.query('SELECT id, name FROM repositories');
    const repos = reposResult.rows;
    
    // Get all teams (we'll check membership via Permit.io)
    const teamsResult = await pool.query('SELECT id, name FROM teams');
    const allTeams = teamsResult.rows;
    
    // Filter teams where user is a member (via Permit.io)
    const teams = [];
    for (const team of allTeams) {
      const isMember = await permit.check(
        `user:${user.email}`,
        'member',
        `team:${team.id}`
      );
      if (isMember) {
        teams.push(team);
      }
    }
    
    const graph = {
      user: user.email,
      directAccess: [] as any[],
      teamAccess: [] as any[],
      summary: {
        totalRepos: 0,
        directRepos: 0,
        teamRepos: 0,
        teams: teams.length
      }
    };
    
    // Check permissions for each repo
    for (const repo of repos) {
      const permissions = {
        read: await permit.check(`user:${user.email}`, 'read', `repository:${repo.id}`),
        write: await permit.check(`user:${user.email}`, 'write', `repository:${repo.id}`),
        admin: await permit.check(`user:${user.email}`, 'admin', `repository:${repo.id}`)
      };
      
      if (permissions.read || permissions.write || permissions.admin) {
        graph.summary.totalRepos++;
        
        const accessInfo = {
          repoId: repo.id,
          repoName: repo.name,
          permissions: Object.keys(permissions).filter(k => permissions[k as keyof typeof permissions])
        };
        
        // Try to determine if access is direct or via team
        // This is simplified - in production you'd query Permit.io's relationship API
        const hasTeamAccess = teams.length > 0;
        
        if (hasTeamAccess) {
          graph.teamAccess.push(accessInfo);
          graph.summary.teamRepos++;
        } else {
          graph.directAccess.push(accessInfo);
          graph.summary.directRepos++;
        }
      }
    }
    
    res.json({ graph });
  } catch (error) {
    console.error('Permission graph error:', error);
    res.status(500).json({ error: 'Failed to build permission graph' });
  }
}

export async function getAuditLogs(req: AuthRequest, res: Response) {
  try {
    const user = req.user!;
    const { limit = 50, offset = 0, resourceType, action } = req.query;
    
    let query = 'SELECT * FROM audit_logs WHERE user_id = $1';
    const params: any[] = [user.id];
    let paramIndex = 2;
    
    if (resourceType) {
      query += ` AND resource_type = $${paramIndex}`;
      params.push(resourceType);
      paramIndex++;
    }
    
    if (action) {
      query += ` AND action = $${paramIndex}`;
      params.push(action);
      paramIndex++;
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    res.json({
      logs: result.rows,
      count: result.rows.length,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
}

export async function getRepositoryAuditLogs(req: AuthRequest, res: Response) {
  try {
    const { id: repoId } = req.params;
    const user = req.user!;
    const { limit = 50, offset = 0 } = req.query;
    
    // Check if user has admin access to view repo audit logs
    const isAdmin = await permit.check(
      `user:${user.email}`,
      'admin',
      `repository:${repoId}`
    );
    
    if (!isAdmin) {
      return res.status(403).json({
        error: 'Only repo admins can view audit logs'
      });
    }
    
    const result = await pool.query(
      `SELECT * FROM audit_logs 
       WHERE resource_type = 'repositories' AND resource_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [repoId, limit, offset]
    );
    
    res.json({
      repoId,
      logs: result.rows,
      count: result.rows.length,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    console.error('Get repo audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch repository audit logs' });
  }
}
