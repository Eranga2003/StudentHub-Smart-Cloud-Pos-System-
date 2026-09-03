import { Router } from 'express';
import { notificationController } from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/v1/notifications
router.get('/', authMiddleware, notificationController.getNotifications);

export default router;
