import { Router } from 'express';
import { customerController } from '../controllers/customerController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

// GET /api/v1/customers
router.get(
  '/',
  authMiddleware,
  requireRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER),
  customerController.getCustomers
);

export default router;
