import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getUserPermissionGraph,
  getAuditLogs,
  getRepositoryAuditLogs
} from '../controllers/visualization';

const router = Router();

router.get('/permission-graph', authenticate, getUserPermissionGraph);
router.get('/audit-logs', authenticate, getAuditLogs);
router.get('/repositories/:id/audit-logs', authenticate, getRepositoryAuditLogs);

export default router;
