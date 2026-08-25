import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import profileRoutes from './profile.routes.js';
import privacyRoutes from './privacy.routes.js';
import securityRoutes from './security.routes.js';
import connectedAccountRoutes from './connectedAccount.routes.js';
import activityLogRoutes from './activityLog.routes.js';
import deviceRoutes from './device.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const router = Router();

// Register sub-routers
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/privacy', privacyRoutes);
router.use('/security', securityRoutes);
router.use('/connected-accounts', connectedAccountRoutes);
router.use('/activity-logs', activityLogRoutes);
router.use('/devices', deviceRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;







