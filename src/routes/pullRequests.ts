import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createPullRequest,
  approvePullRequest,
  mergePullRequest,
  createBranchProtection
} from '../controllers/pullRequests';

const router = Router();

router.post('/', authenticate, createPullRequest);
router.post('/:id/approve', authenticate, approvePullRequest);
router.post('/:id/merge', authenticate, mergePullRequest);
router.post('/branch-protection', authenticate, createBranchProtection);

export default router;
