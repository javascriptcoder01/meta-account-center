import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import profileController from '../controllers/profile.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validation.middleware.js';
import {
  updateProfileValidator,
  changePasswordValidator,
  changeEmailValidator,
  changePhoneValidator,
  changeProfilePictureValidator
} from '../validators/profile.validator.js';
import config from '../config/env.js';

const router = Router();

const sensitiveRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.env === 'test' ? 10000 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many profile modification attempts, please try again in 15 minutes.',
    error: {
      code: 'TOO_MANY_REQUESTS',
      details: []
    }
  },
  statusCode: 429
});

router.use(authenticate);

router.get('/', profileController.getProfile);
router.patch('/', updateProfileValidator, validateRequest, profileController.updateProfile);

router.post('/change-password', sensitiveRateLimiter, changePasswordValidator, validateRequest, profileController.changePassword);
router.patch('/email', sensitiveRateLimiter, changeEmailValidator, validateRequest, profileController.changeEmail);
router.patch('/phone', sensitiveRateLimiter, changePhoneValidator, validateRequest, profileController.changePhone);

router.patch('/profile-picture', changeProfilePictureValidator, validateRequest, profileController.changeProfilePicture);

export default router;
