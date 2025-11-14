import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { permit } from '../config/permit';
import { pool } from '../config/database';

export async function createPullRequest(req: AuthRequest, res: Response) {
  try {
    const { repoId, title, description, sourceBranch, targetBranch } = req.body;
    const user = req.user!;
    
    const canWrite = await permit.check(
      `user:${user.email}`,
      'write',
      `repository:${repoId}`
    );
    
    if (!canWrite) {
      return res.status(403).json({
        error: 'You need write access to create PRs'
      });
    }
    
    const result = await pool.query(
      `INSERT INTO pull_requests
        (repo_id, author_id, title, description, source_branch, target_branch)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [repoId, user.id, title, description, sourceBranch, targetBranch]
    );
    
    const pr = result.rows[0];
    
    await permit.api.resourceInstances.create({
      resource: 'pull_request',
      key: pr.id.toString(),
      tenant: 'default',
      attributes: { title: pr.title }
    });
    
    await permit.api.relationshipTuples.create({
      subject: `user:${user.email}`,
      relation: 'author',
      object: `pull_request:${pr.id}`
    });
    
    res.status(201).json({
      message: 'Pull request created',
      pullRequest: pr
    });
  } catch (error) {
    console.error('Create PR error:', error);
    res.status(500).json({ error: 'Failed to create pull request' });
  }
}

export async function approvePullRequest(req: AuthRequest, res: Response) {
  try {
    const { id: prId } = req.params;
    const { comment } = req.body;
    const user = req.user!;
    
    const prResult = await pool.query(
      'SELECT * FROM pull_requests WHERE id = $1',
      [prId]
    );
    const pr = prResult.rows[0];
    
    if (!pr) {
      return res.status(404).json({ error: 'PR not found' });
    }
    
    const canRead = await permit.check(
      `user:${user.email}`,
      'read',
      `repository:${pr.repo_id}`
    );
    
    if (!canRead) {
      return res.status(403).json({
        error: 'You need access to this repo to review'
      });
    }
    
    if (pr.author_id === user.id) {
      return res.status(400).json({
        error: 'You cannot approve your own pull request'
      });
    }
    
    const existingReview = await pool.query(
      'SELECT * FROM reviews WHERE pr_id = $1 AND reviewer_id = $2',
      [prId, user.id]
    );
    
    if (existingReview.rows.length > 0) {
      await pool.query(
        'UPDATE reviews SET status = $1, comment = $2 WHERE pr_id = $3 AND reviewer_id = $4',
        ['approved', comment, prId, user.id]
      );
    } else {
      await pool.query(
        'INSERT INTO reviews (pr_id, reviewer_id, status, comment) VALUES ($1, $2, $3, $4)',
        [prId, user.id, 'approved', comment]
      );
    }
    
    res.json({
      message: 'Pull request approved',
      prId,
      reviewer: user.email
    });
  } catch (error) {
    console.error('Approve PR error:', error);
    res.status(500).json({ error: 'Failed to approve pull request' });
  }
}

export async function mergePullRequest(req: AuthRequest, res: Response) {
  try {
    const { id: prId } = req.params;
    const user = req.user!;
    
    const prResult = await pool.query(
      'SELECT * FROM pull_requests WHERE id = $1',
      [prId]
    );
    const pr = prResult.rows[0];
    
    if (!pr) {
      return res.status(404).json({ error: 'PR not found' });
    }
    
    if (pr.status !== 'open') {
      return res.status(400).json({ error: 'PR is not open' });
    }
    
    const canWrite = await permit.check(
      `user:${user.email}`,
      'write',
      `repository:${pr.repo_id}`
    );
    
    if (!canWrite) {
      return res.status(403).json({
        error: 'You need write access to merge PRs'
      });
    }
    
    const protectionResult = await pool.query(
      `SELECT * FROM branch_protection_rules
        WHERE repo_id = $1 AND $2 LIKE branch_pattern`,
      [pr.repo_id, pr.target_branch]
    );
    
    const protection = protectionResult.rows[0];
    
    if (protection) {
      const approvalResult = await pool.query(
        `SELECT COUNT(*) as count FROM reviews
          WHERE pr_id = $1 AND status = 'approved'`,
        [prId]
      );
      const approvalCount = parseInt(approvalResult.rows[0].count);
      
      const isAdmin = await permit.check(
        `user:${user.email}`,
        'admin',
        `repository:${pr.repo_id}`
      );
      
      if (!isAdmin || !protection.allow_admin_override) {
        if (approvalCount < protection.required_approvals) {
          return res.status(400).json({
            error: 'Insufficient approvals',
            required: protection.required_approvals,
            current: approvalCount,
            message: `This PR requires ${protection.required_approvals} approval(s) before merging`
          });
        }
      }
    }
    
    await pool.query(
      `UPDATE pull_requests
        SET status = 'merged', merged_at = NOW(), merged_by = $1
        WHERE id = $2`,
      [user.id, prId]
    );
    
    res.json({
      message: 'Pull request merged successfully',
      prId,
      mergedBy: user.email,
      mergedAt: new Date()
    });
  } catch (error) {
    console.error('Merge PR error:', error);
    res.status(500).json({ error: 'Failed to merge pull request' });
  }
}

export async function createBranchProtection(req: AuthRequest, res: Response) {
  try {
    const { repoId, branchPattern, requiredApprovals, requireStatusChecks, requireConversationResolution, allowAdminOverride } = req.body;
    const user = req.user!;
    
    const isAdmin = await permit.check(
      `user:${user.email}`,
      'admin',
      `repository:${repoId}`
    );
    
    if (!isAdmin) {
      return res.status(403).json({
        error: 'Only repo admins can create branch protection rules'
      });
    }
    
    const result = await pool.query(
      `INSERT INTO branch_protection_rules
        (repo_id, branch_pattern, required_approvals, require_status_checks,
         require_conversation_resolution, allow_admin_override)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [repoId, branchPattern, requiredApprovals, requireStatusChecks,
        requireConversationResolution, allowAdminOverride]
    );
    
    res.status(201).json({
      message: 'Branch protection rule created',
      rule: result.rows[0]
    });
  } catch (error) {
    console.error('Create branch protection error:', error);
    res.status(500).json({ error: 'Failed to create branch protection' });
  }
}
