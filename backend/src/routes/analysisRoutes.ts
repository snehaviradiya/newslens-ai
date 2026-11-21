import { Router } from 'express';
import { analysisController } from '../controllers/analysisController.js';

const router = Router();
router.get('/', analysisController.getAll);
router.get('/:id', analysisController.getById);
export default router;
