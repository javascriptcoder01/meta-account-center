import { body } from 'express-validator';

const allowedVisibilities = ['PUBLIC', 'FRIENDS', 'PRIVATE'];

export const updatePrivacyValidator = [
  body('profileVisibility')
    .optional()
    .isIn(allowedVisibilities)
    .withMessage('profileVisibility must be one of: PUBLIC, FRIENDS, PRIVATE'),
  body('emailVisibility')
    .optional()
    .isIn(allowedVisibilities)
    .withMessage('emailVisibility must be one of: PUBLIC, FRIENDS, PRIVATE'),
  body('phoneVisibility')
    .optional()
    .isIn(allowedVisibilities)
    .withMessage('phoneVisibility must be one of: PUBLIC, FRIENDS, PRIVATE'),
  body('personalizedAds')
    .optional()
    .isBoolean()
    .withMessage('personalizedAds must be a boolean value'),
  body('dataSharing')
    .optional()
    .isBoolean()
    .withMessage('dataSharing must be a boolean value')
];
