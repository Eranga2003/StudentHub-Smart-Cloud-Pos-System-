import { Router } from 'express';
import { reportController } from '../controllers/reportController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

// GET /api/v1/reports
router.get(
  '/',
  authMiddleware,
  requireRole(ROLES.ADMIN, ROLES.MANAGER),
  reportController.getReports
);

export default router;
