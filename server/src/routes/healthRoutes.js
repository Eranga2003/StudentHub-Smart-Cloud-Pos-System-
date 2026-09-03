import { Router } from 'express';
import { healthController } from '../controllers/healthController.js';

const router = Router();

// GET /api/v1/health or /api/health (public, no auth required)
router.get('/', healthController.checkHealth);

export default router;
