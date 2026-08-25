import { Router } from 'express';
import privacyController from '../controllers/privacy.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validation.middleware.js';
import { updatePrivacyValidator } from '../validators/privacy.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', privacyController.getPrivacy);
router.patch('/', updatePrivacyValidator, validateRequest, privacyController.updatePrivacy);

export default router;
