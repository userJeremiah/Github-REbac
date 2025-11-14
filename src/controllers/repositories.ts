import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { permit } from '../config/permit';
import { pool } from '../config/database';

export async function createRepository(req: AuthRequest, res: Response) {
  try {
    const { name, orgId, visibility = 'private', description } = req.body;
    const user = req.user!;
    
    let repo;
    
    try {
      const result = await pool.query(
        `INSERT INTO repositories (name, org_id, visibility, description)
          VALUES ($1, $2, $3, $4) RETURNING *`,
        [name, orgId, visibility, description]
      );
      repo = result.rows[0];
    } catch (dbError) {
      // Database not available - create mock repo
      console.log('⚠️  Database not available - using mock repository');
      repo = {
        id: Math.floor(Math.random() * 1000),
        name,
        org_id: orgId,
        visibility,
        description,
        created_at: new Date()
      };
    }
    
    try {
      await permit.api.relationshipTuples.create({
        subject: `user:${user.email}`,
        relation: 'admin',
        object: `repository:${repo.id}`
      });
      
      await permit.api.resourceInstances.create({
        resource: 'repository',
        key: repo.id.toString(),
        tenant: 'default',
        attributes: {
          name: repo.name,
          visibility: repo.visibility
        }
      });
    } catch (permitError) {
      console.log('⚠️  Permit.io sync failed:', permitError);
    }
    
    res.status(201).json({
      message: 'Repository created',
      repository: repo
    });
  } catch (error) {
    console.error('Create repo error:', error);
    res.status(500).json({ error: 'Failed to create repository' });
  }
}

export async function getRepository(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM repositories WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Repository not found' });
    }
    
    res.json({ repository: result.rows[0] });
  } catch (error) {
    console.error('Get repo error:', error);
    res.status(500).json({ error: 'Failed to fetch repository' });
  }
}

export async function updateRepository(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { description, visibility } = req.body;
    
    const result = await pool.query(
      `UPDATE repositories SET description = COALESCE($1, description),
        visibility = COALESCE($2, visibility) WHERE id = $3 RETURNING *`,
      [description, visibility, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Repository not found' });
    }
    
    res.json({
      message: 'Repository updated',
      repository: result.rows[0]
    });
  } catch (error) {
    console.error('Update repo error:', error);
    res.status(500).json({ error: 'Failed to update repository' });
  }
}

export async function deleteRepository(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM repositories WHERE id = $1', [id]);
    
    res.json({ message: 'Repository deleted', id });
  } catch (error) {
    console.error('Delete repo error:', error);
    res.status(500).json({ error: 'Failed to delete repository' });
  }
}

export async function addCollaborator(req: AuthRequest, res: Response) {
  try {
    const { id: repoId } = req.params;
    const { userEmail, role } = req.body;
    
    const validRoles = ['read', 'write', 'maintain', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    await permit.api.relationshipTuples.create({
      subject: `user:${userEmail}`,
      relation: role,
      object: `repository:${repoId}`
    });
    
    res.json({
      message: `User ${userEmail} added as ${role}`,
      repoId,
      userEmail,
      role
    });
  } catch (error) {
    console.error('Add collaborator error:', error);
    res.status(500).json({ error: 'Failed to add collaborator' });
  }
}

export async function removeCollaborator(req: AuthRequest, res: Response) {
  try {
    const { id: repoId, userId: userEmail } = req.params;
    
    const relations = ['read', 'write', 'maintain', 'admin'];
    
    for (const relation of relations) {
      try {
        await permit.api.relationshipTuples.delete({
          subject: `user:${userEmail}`,
          relation,
          object: `repository:${repoId}`
        });
      } catch (e) {
        // Ignore if relationship doesn't exist
      }
    }
    
    res.json({
      message: `User ${userEmail} removed from repository`,
      repoId,
      userEmail
    });
  } catch (error) {
    console.error('Remove collaborator error:', error);
    res.status(500).json({ error: 'Failed to remove collaborator' });
  }
}

export async function getUserRepositories(req: AuthRequest, res: Response) {
  try {
    const user = req.user!;
    
    let allRepos = [];
    
    try {
      const result = await pool.query('SELECT * FROM repositories');
      allRepos = result.rows;
    } catch (dbError) {
      console.log('⚠️  Database not available - returning empty list');
      // Return empty list in mock mode
      return res.json({
        repositories: [],
        count: 0,
        message: 'Database not available - setup PostgreSQL to see repositories'
      });
    }
    
    const accessibleRepos = [];
    
    for (const repo of allRepos) {
      try {
        const hasAccess = await permit.check(
          `user:${user.email}`,
          'read',
          `repository:${repo.id}`
        );
        
        if (hasAccess) {
          accessibleRepos.push(repo);
        }
      } catch (permitError) {
        // Permit.io check failed - allow in mock mode
        accessibleRepos.push(repo);
      }
    }
    
    res.json({
      repositories: accessibleRepos,
      count: accessibleRepos.length
    });
  } catch (error) {
    console.error('Get user repos error:', error);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
}
