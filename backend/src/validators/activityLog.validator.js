import { query } from 'express-validator';
import { ACTIVITY_CATEGORIES } from '../constants/activityTypes.js';

const allowedCategories = Object.values(ACTIVITY_CATEGORIES);

export const getActivityLogsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be an integer greater than or equal to 1')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100')
    .toInt(),
  query('category')
    .optional()
    .isIn(allowedCategories)
    .withMessage(`category must be one of: ${allowedCategories.join(', ')}`)
];
