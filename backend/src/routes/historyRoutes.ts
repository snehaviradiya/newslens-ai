import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { historyController } from '../controllers/historyController.js';

const router = Router();
router.get('/', authenticateToken, historyController.getAll);
export default router;
