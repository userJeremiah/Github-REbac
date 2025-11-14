import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  createRepository,
  getRepository,
  updateRepository,
  deleteRepository,
  addCollaborator,
  removeCollaborator,
  getUserRepositories
} from '../controllers/repositories';

const router = Router();

router.post('/', authenticate, createRepository);
router.get('/', authenticate, getUserRepositories);
router.get('/:id', authenticate, authorize('repository', 'read'), getRepository);
router.patch('/:id', authenticate, authorize('repository', 'write'), updateRepository);
router.delete('/:id', authenticate, authorize('repository', 'admin'), deleteRepository);
router.post('/:id/collaborators', authenticate, authorize('repository', 'admin'), addCollaborator);
router.delete('/:id/collaborators/:userId', authenticate, authorize('repository', 'admin'), removeCollaborator);

export default router;
