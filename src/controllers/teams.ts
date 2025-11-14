import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { permit } from '../config/permit';
import { pool } from '../config/database';

export async function createTeam(req: AuthRequest, res: Response) {
  try {
    const { name, orgId, description } = req.body;
    const user = req.user!;
    
    // Ensure organization exists (create if needed for testing)
    try {
      await pool.query(
        `INSERT OR IGNORE INTO organizations (id, name, owner_id) VALUES ($1, $2, $3)`,
        [orgId, `Org ${orgId}`, user.id]
      );
    } catch (e) {
      // Ignore if already exists
    }
    
    const result = await pool.query(
      `INSERT INTO teams (name, org_id, description)
        VALUES ($1, $2, $3) RETURNING *`,
      [name, orgId, description]
    );
    
    const team = result.rows[0];
    
    await permit.api.resourceInstances.create({
      resource: 'team',
      key: team.id.toString(),
      tenant: 'default',
      attributes: { name: team.name }
    });
    
    await permit.api.relationshipTuples.create({
      subject: `user:${user.email}`,
      relation: 'admin',
      object: `team:${team.id}`
    });
    
    res.status(201).json({
      message: 'Team created',
      team
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
}

export async function addTeamMember(req: AuthRequest, res: Response) {
  try {
    const { id: teamId } = req.params;
    const { userEmail } = req.body;
    
    await permit.api.relationshipTuples.create({
      subject: `user:${userEmail}`,
      relation: 'member',
      object: `team:${teamId}`
    });
    
    res.json({
      message: `User ${userEmail} added to team`,
      teamId,
      userEmail
    });
  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({ error: 'Failed to add team member' });
  }
}

export async function removeTeamMember(req: AuthRequest, res: Response) {
  try {
    const { id: teamId, userId: userEmail } = req.params;
    
    await permit.api.relationshipTuples.delete({
      subject: `user:${userEmail}`,
      relation: 'member',
      object: `team:${teamId}`
    });
    
    res.json({
      message: `User ${userEmail} removed from team`,
      teamId,
      userEmail
    });
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({ error: 'Failed to remove team member' });
  }
}

export async function grantTeamRepoAccess(req: AuthRequest, res: Response) {
  try {
    const { id: teamId } = req.params;
    const { repoId, role } = req.body;
    
    await permit.api.relationshipTuples.create({
      subject: `team:${teamId}`,
      relation: role,
      object: `repository:${repoId}`
    });
    
    res.json({
      message: `Team granted ${role} access to repository`,
      teamId,
      repoId,
      role
    });
  } catch (error) {
    console.error('Grant team access error:', error);
    res.status(500).json({ error: 'Failed to grant team access' });
  }
}
