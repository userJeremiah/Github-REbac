import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  aiCodeReview,
  generatePRDescription,
  explainPermissions,
  triageIssue
} from '../controllers/ai';

const router = Router();

router.post('/pull-requests/:id/ai-review', authenticate, aiCodeReview);
router.post('/generate-pr-description', authenticate, generatePRDescription);
router.post('/explain-permissions', authenticate, explainPermissions);
router.post('/triage-issue', authenticate, triageIssue);

export default router;
