import { Router } from 'express';
import { inventoryController } from '../controllers/inventoryController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

// GET /api/v1/inventory
router.get(
  '/',
  authMiddleware,
  requireRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.INVENTORY_MANAGER),
  inventoryController.getInventory
);

export default router;
