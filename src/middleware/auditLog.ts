import { pool } from '../config/database';
import { AuthRequest } from './auth';
import { Response, NextFunction } from 'express';

export async function auditLog(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const originalJson = res.json.bind(res);
  
  res.json = function (data: any) {
    if (req.user) {
      const resourceType = req.baseUrl.split('/').pop() || 'unknown';
      const resourceId = req.params.id || req.params.repoId || req.params.prId || null;
      
      pool.query(
        `INSERT INTO audit_logs
          (user_id, user_email, action, resource_type, resource_id, ip_address, user_agent, status_code)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          req.user.id,
          req.user.email,
          req.method,
          resourceType,
          resourceId,
          req.ip,
          req.get('user-agent'),
          res.statusCode
        ]
      ).catch((err: any) => console.error('Audit log error:', err));
    }
    
    return originalJson(data);
  };
  
  next();
}
