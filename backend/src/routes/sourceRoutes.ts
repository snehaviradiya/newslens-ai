// News Sources Routes

import { Router } from 'express';
import { sourceController } from '../controllers/sourceController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', sourceController.getAll);
router.post('/validate-feed', sourceController.validateFeed);
router.get('/:id', sourceController.getById);

// Source Management (Requires authenticated Researcher or Admin)
router.post('/', authenticateToken, requireRole(['RESEARCHER', 'ADMIN']), sourceController.create);
router.patch('/:id', authenticateToken, requireRole(['RESEARCHER', 'ADMIN']), sourceController.update);

export default router;
