import { param } from 'express-validator';

export const deleteDeviceValidator = [
  param('sessionId')
    .trim()
    .notEmpty()
    .withMessage('sessionId is required')
    .isUUID(4)
    .withMessage('sessionId must be a valid UUID v4')
];
