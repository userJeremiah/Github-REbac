import { Request, Response, NextFunction } from 'express';
import { permit } from '../config/permit';
import { pool } from '../config/database';

export interface AuthRequest extends Request {
  user?: { id: number; email: string; name: string };
}

async function getUserByEmail(email: string) {
  try {
    const result = await pool.query(
      'SELECT id, email, name FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  } catch (error) {
    // Database not available - return mock user
    console.log('⚠️  Database not available - using mock user');
    return {
      id: 1,
      email: email,
      name: email.split('@')[0]
    };
  }
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const userEmail = req.headers['x-user-email'] as string;
  
  if (!userEmail) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const user = await getUserByEmail(userEmail);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  
  req.user = user;
  next();
}

export function authorize(resource: string, action: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const resourceId = req.params.id || req.params.repoId;
    
    try {
      const allowed = await permit.check(
        `user:${req.user.email}`,
        action,
        `${resource}:${resourceId}`
      );
      
      if (!allowed) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `You don't have '${action}' permission on this ${resource}`
        });
      }
    } catch (error) {
      // Permit.io not available - allow in mock mode
      console.log(`⚠️  Permit.io check failed - allowing ${action} on ${resource} in MOCK MODE`);
    }
    
    next();
  };
}
