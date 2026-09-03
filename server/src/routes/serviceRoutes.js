import { Router } from 'express';
import { serviceController } from '../controllers/serviceController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

// GET /api/v1/services
router.get(
  '/',
  authMiddleware,
  requireRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER),
  serviceController.getServices
);

export default router;
