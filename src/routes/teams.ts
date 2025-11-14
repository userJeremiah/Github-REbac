import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  createTeam,
  addTeamMember,
  removeTeamMember,
  grantTeamRepoAccess
} from '../controllers/teams';

const router = Router();

router.post('/', authenticate, createTeam);
router.post('/:id/members', authenticate, authorize('team', 'admin'), addTeamMember);
router.delete('/:id/members/:userId', authenticate, authorize('team', 'admin'), removeTeamMember);
router.post('/:id/repositories', authenticate, authorize('team', 'admin'), grantTeamRepoAccess);

export default router;
