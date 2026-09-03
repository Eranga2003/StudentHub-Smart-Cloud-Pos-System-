import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import inventoryRoutes from './inventoryRoutes.js';
import salesRoutes from './salesRoutes.js';
import purchaseRoutes from './purchaseRoutes.js';
import supplierRoutes from './supplierRoutes.js';
import customerRoutes from './customerRoutes.js';
import expenseRoutes from './expenseRoutes.js';
import reportRoutes from './reportRoutes.js';
import employeeRoutes from './employeeRoutes.js';
import notificationRoutes from './notificationRoutes.js';

const router = Router();

// Version 1 API Route Registrations
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/services', serviceRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/sales', salesRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/customers', customerRoutes);
router.use('/expenses', expenseRoutes);
router.use('/reports', reportRoutes);
router.use('/employees', employeeRoutes);
router.use('/notifications', notificationRoutes);

export default router;
