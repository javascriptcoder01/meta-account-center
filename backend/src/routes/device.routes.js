import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import deviceController from '../controllers/device.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validation.middleware.js';
import { deleteDeviceValidator } from '../validators/device.validator.js';
import config from '../config/env.js';

const router = Router();

const deviceRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.env === 'test' ? 10000 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many device modification attempts, please try again in 15 minutes.',
    error: {
      code: 'TOO_MANY_REQUESTS',
      details: []
    }
  },
  statusCode: 429
});

router.use(authenticate);

router.get('/', deviceController.getActiveDevices);
router.delete('/:sessionId', deviceRateLimiter, deleteDeviceValidator, validateRequest, deviceController.revokeDeviceSession);

export default router;
