import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/v1/auth/profile
router.get('/profile', authMiddleware, authController.getProfile);

export default router;
