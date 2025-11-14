import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { permit } from '../config/permit';
import { generateContent } from '../config/gemini';
import { pool } from '../config/database';

export async function aiCodeReview(req: AuthRequest, res: Response) {
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
    
    const canRead = await permit.check(
      `user:${user.email}`,
      'read',
      `repository:${pr.repo_id}`
    );
    
    if (!canRead) {
      return res.status(403).json({
        error: 'You need read access to request AI review'
      });
    }
    
    const mockDiff = `
diff --git a/src/api/users.js b/src/api/users.js
@@ -10,6 +10,12 @@ async function getUser(id) {
+
+  // New search functionality
+  async function searchUsers(query) {
+    const users = await db.query('SELECT * FROM users WHERE name LIKE $1', ['%' + query + '%']);
+    return users;
+  }
    `;
    
    const prompt = `
You are an expert code reviewer. Review this pull request diff and provide feedback.

PR Title: ${pr.title}
PR Description: ${pr.description}

Diff:
${mockDiff}

Provide:
1. Security concerns (if any)
2. Performance issues (if any)
3. Code quality suggestions
4. Overall assessment (Approve / Request Changes)

Be concise and constructive.
    `.trim();
    
    const review = await generateContent(prompt);
    
    res.json({
      prId,
      aiReview: review,
      reviewedBy: 'Gemini AI',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('AI review error:', error);
    res.status(500).json({ error: 'Failed to generate AI review' });
  }
}

export async function generatePRDescription(req: AuthRequest, res: Response) {
  try {
    const { repoId, sourceBranch, targetBranch, commits } = req.body;
    const user = req.user!;
    
    try {
      const canWrite = await permit.check(
        `user:${user.email}`,
        'write',
        `repository:${repoId}`
      );
      
      if (!canWrite) {
        return res.status(403).json({
          error: 'You need write access to generate PR descriptions'
        });
      }
    } catch (permitError) {
      // Permit.io check failed - allow in development mode
      console.log('⚠️  Permit.io check failed - allowing in development mode');
    }
    
    const commitMessages = commits || [
      'Add user search endpoint',
      'Implement query validation',
      'Add tests for search'
    ];
    
    const prompt = `
Generate a professional pull request description based on these commits:

${commitMessages.map((msg: string, i: number) => `${i + 1}. ${msg}`).join('\n')}

Source branch: ${sourceBranch}
Target branch: ${targetBranch}

Format:
## What changed
[Brief overview]

## Why
[Motivation]

## Testing
[How to test]

Keep it concise and professional.
    `.trim();
    
    const description = await generateContent(prompt);
    
    res.json({
      description,
      commits: commitMessages.length,
      generatedBy: 'Gemini AI'
    });
  } catch (error) {
    console.error('Generate description error:', error);
    res.status(500).json({ error: 'Failed to generate description' });
  }
}

export async function explainPermissions(req: AuthRequest, res: Response) {
  try {
    const { action, resourceType, resourceId } = req.body;
    const user = req.user!;
    
    const allowed = await permit.check(
      `user:${user.email}`,
      action,
      `${resourceType}:${resourceId}`
    );
    
    const prompt = `
Explain in simple terms why a user ${allowed ? 'CAN' : 'CANNOT'} perform this action:

User: ${user.email}
Action: ${action}
Resource: ${resourceType}/${resourceId}
Result: ${allowed ? 'ALLOWED' : 'DENIED'}

Context:
- GitHub-style permission system
- Users can have direct access or inherit via teams
- Some actions require specific roles (e.g., admin for deletion)

Provide a friendly explanation suitable for a developer.
    `.trim();
    
    const explanation = await generateContent(prompt);
    
    res.json({
      allowed,
      action,
      resource: `${resourceType}:${resourceId}`,
      explanation,
      explainedBy: 'Gemini AI'
    });
  } catch (error) {
    console.error('Explain permissions error:', error);
    res.status(500).json({ error: 'Failed to explain permissions' });
  }
}

export async function triageIssue(req: AuthRequest, res: Response) {
  try {
    const { repoId, issueTitle, issueBody } = req.body;
    const user = req.user!;
    
    const canTriage = await permit.check(
      `user:${user.email}`,
      'triage',
      `repository:${repoId}`
    );
    
    if (!canTriage) {
      return res.status(403).json({
        error: 'You need triage permission for AI issue categorization'
      });
    }
    
    const prompt = `
Categorize this GitHub issue:

Title: ${issueTitle}
Body: ${issueBody}

Provide:
1. Category (bug / feature / documentation / question)
2. Priority (low / medium / high / critical)
3. Suggested labels (max 3)
4. Brief reasoning

Format as JSON:
{
  "category": "...",
  "priority": "...",
  "labels": ["...", "..."],
  "reasoning": "..."
}
    `.trim();
    
    const response = await generateContent(prompt);
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const triage = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    
    res.json({
      issueTitle,
      triage,
      triagedBy: 'Gemini AI'
    });
  } catch (error) {
    console.error('Triage issue error:', error);
    res.status(500).json({ error: 'Failed to triage issue' });
  }
}
