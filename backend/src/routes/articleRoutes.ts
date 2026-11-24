// News Articles Routes

import { Router } from 'express';
import { articleController } from '../controllers/articleController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', articleController.getAll);
router.get('/:id', articleController.getById);
router.post('/analyze', articleController.analyzeArticle);
router.post('/analyze/batch', authenticateToken, articleController.analyzeStoredArticles);
router.post('/:id/analyze', authenticateToken, articleController.analyzeStoredArticle);

export default router;
