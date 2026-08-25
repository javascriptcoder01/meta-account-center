import { Router } from 'express';
import connectedAccountController from '../controllers/connectedAccount.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validation.middleware.js';
import { createConnectedAccountValidator } from '../validators/connectedAccount.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', connectedAccountController.getConnectedAccounts);
router.post('/', createConnectedAccountValidator, validateRequest, connectedAccountController.connectAccount);
router.delete('/:id', connectedAccountController.removeAccount);

export default router;
