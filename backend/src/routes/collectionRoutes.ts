// Collection Pipeline Routes

import { Router } from 'express';
import { collectionController } from '../controllers/collectionController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Public status check
router.get('/status', collectionController.getStatus);

// Protected manual collection trigger (Researcher or Admin)
router.post('/run', authenticateToken, requireRole(['RESEARCHER', 'ADMIN']), collectionController.run);

export default router;
