import { Router } from 'express';
import { productController } from '../controllers/productController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

// GET /api/v1/products
router.get(
  '/',
  authMiddleware,
  requireRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER, ROLES.INVENTORY_MANAGER),
  productController.getProducts
);

export default router;
