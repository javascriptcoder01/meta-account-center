import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import securityController from '../controllers/security.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validation.middleware.js';
import { updateSecurityValidator } from '../validators/security.validator.js';
import config from '../config/env.js';

const router = Router();

const securityRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.env === 'test' ? 10000 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many security configuration attempts, please try again in 15 minutes.',
    error: {
      code: 'TOO_MANY_REQUESTS',
      details: []
    }
  },
  statusCode: 429
});

router.use(authenticate);

router.get('/settings', securityController.getSecuritySettings);
router.patch('/settings', securityRateLimiter, updateSecurityValidator, validateRequest, securityController.updateSecuritySettings);

export default router;
