// News Articles Routes

import { Router } from 'express';
import { articleController } from '../controllers/articleController.js';

const router = Router();

router.get('/', articleController.getAll);
router.get('/:id', articleController.getById);
router.post('/analyze', articleController.analyzeArticle);

export default router;
