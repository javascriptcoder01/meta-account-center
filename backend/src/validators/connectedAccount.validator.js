import { body } from 'express-validator';
import { PROVIDERS } from '../constants/providers.js';

const allowedProviders = Object.values(PROVIDERS);

export const createConnectedAccountValidator = [
  body('provider')
    .trim()
    .notEmpty()
    .withMessage('provider is required')
    .isIn(allowedProviders)
    .withMessage(`provider must be one of: ${allowedProviders.join(', ')}`),
  body('providerUserId')
    .trim()
    .notEmpty()
    .withMessage('providerUserId is required')
    .isString()
    .withMessage('providerUserId must be a valid string')
    .isLength({ max: 100 })
    .withMessage('providerUserId cannot exceed 100 characters'),
  body('displayName')
    .trim()
    .notEmpty()
    .withMessage('displayName is required')
    .isString()
    .withMessage('displayName must be a valid string')
    .isLength({ max: 100 })
    .withMessage('displayName cannot exceed 100 characters'),
  body('username')
    .optional({ nullable: true })
    .trim()
    .isString()
    .withMessage('username must be a valid string')
    .isLength({ max: 100 })
    .withMessage('username cannot exceed 100 characters'),
  body('profilePicture')
    .optional({ nullable: true })
    .trim()
    .isString()
    .withMessage('profilePicture must be a valid string')
    .custom((value) => {
      if (value === null || value === '') return true;
      if (!value.startsWith('https://')) {
        throw new Error('profilePicture must be a secure HTTPS URL');
      }
      try {
        new URL(value);
      } catch (e) {
        throw new Error('profilePicture must be a valid URL');
      }
      return true;
    })
];
