import { Router } from 'express';
import activityLogController from '../controllers/activityLog.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validation.middleware.js';
import { getActivityLogsValidator } from '../validators/activityLog.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', getActivityLogsValidator, validateRequest, activityLogController.getActivityLogs);

export default router;
