// News Events Routes

import { Router } from 'express';
import { eventController } from '../controllers/eventController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/detect', authenticateToken, requireRole(['RESEARCHER', 'ADMIN']), eventController.detect);
router.get('/', eventController.getAll);
router.get('/:id/articles', eventController.getArticles);
router.post('/:id/compare', authenticateToken, eventController.compare);
router.get('/:id', eventController.getById);

export default router;
