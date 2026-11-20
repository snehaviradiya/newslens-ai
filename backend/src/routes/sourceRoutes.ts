// News Sources Routes

import { Router } from 'express';
import { sourceController } from '../controllers/sourceController.js';

const router = Router();

router.get('/', sourceController.getAll);
router.get('/:id', sourceController.getById);

export default router;
