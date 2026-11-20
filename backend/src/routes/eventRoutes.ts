// News Events Routes

import { Router } from 'express';
import { eventController } from '../controllers/eventController.js';

const router = Router();

router.get('/', eventController.getAll);
router.get('/:id', eventController.getById);

export default router;
