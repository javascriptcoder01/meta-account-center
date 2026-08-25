import { body } from 'express-validator';

const allowed2FaMethods = ['SMS', 'AUTHENTICATOR_APP', 'EMAIL', null];

export const updateSecurityValidator = [
  body('twoFactorEnabled')
    .optional()
    .isBoolean()
    .withMessage('twoFactorEnabled must be a boolean value'),
  body('twoFactorMethod')
    .optional({ nullable: true })
    .isIn(allowed2FaMethods)
    .withMessage('twoFactorMethod must be one of: SMS, AUTHENTICATOR_APP, EMAIL, or null')
];
