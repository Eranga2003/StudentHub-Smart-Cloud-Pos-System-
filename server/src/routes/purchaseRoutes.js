import { Router } from 'express';
import { purchaseController } from '../controllers/purchaseController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

// GET /api/v1/purchases
router.get(
  '/',
  authMiddleware,
  requireRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.INVENTORY_MANAGER),
  purchaseController.getPurchases
);

export default router;
