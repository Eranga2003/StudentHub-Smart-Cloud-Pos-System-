import { Router } from 'express';
import { salesController } from '../controllers/salesController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

// GET /api/v1/sales
router.get(
  '/',
  authMiddleware,
  requireRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER),
  salesController.getSales
);

export default router;
