import { Router } from 'express';
import { comparisonController } from '../controllers/comparisonController.js';

const router = Router();
router.get('/', comparisonController.getAll);
router.get('/:id', comparisonController.getById);
export default router;
