// Authentication Routes

import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// Public Auth Endpoints
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected Auth Endpoints
router.get('/me', authenticateToken, authController.getProfile);

export default router;
