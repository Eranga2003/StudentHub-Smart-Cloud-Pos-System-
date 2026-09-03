import { Router } from 'express';
import { supplierController } from '../controllers/supplierController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

// GET /api/v1/suppliers
router.get(
  '/',
  authMiddleware,
  requireRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.INVENTORY_MANAGER),
  supplierController.getSuppliers
);

export default router;
