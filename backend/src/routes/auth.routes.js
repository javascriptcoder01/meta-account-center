import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import authController from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validation.middleware.js';
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator
} from '../validators/auth.validator.js';
import config from '../config/env.js';

const router = Router();

const isProduction = config.env === 'production';
const windowMs = isProduction ? 15 * 60 * 1000 : 1 * 60 * 1000;
const windowMinutes = isProduction ? 15 : 1;

const authRateLimiter = rateLimit({
  windowMs,
  max: config.env === 'test' ? 10000 : (isProduction ? 5 : 20),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: `Too many authentication attempts, please try again in ${windowMinutes} minute${windowMinutes > 1 ? 's' : ''}.`,
    error: {
      code: 'TOO_MANY_REQUESTS',
      details: []
    }
  },
  statusCode: 429
});

// Authentication routes
router.post('/register', authRateLimiter, registerValidator, validateRequest, authController.register);
router.post('/login', authRateLimiter, loginValidator, validateRequest, authController.login);
router.post('/refresh', authRateLimiter, authController.refresh);
router.post('/forgot-password', authRateLimiter, forgotPasswordValidator, validateRequest, authController.forgotPassword);
router.post('/reset-password', authRateLimiter, resetPasswordValidator, validateRequest, authController.resetPassword);

// Authenticated routes
router.post('/logout', authenticate, authController.logout);
router.post('/logout-all', authenticate, authController.logoutAll);

export default router;
