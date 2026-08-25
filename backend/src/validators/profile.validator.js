import { body } from 'express-validator';

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

const validateHttpsUrlOrNull = (field) => {
  return body(field)
    .optional({ nullable: true, checkFalsy: false })
    .custom((value) => {
      if (value === null) return true;
      if (typeof value !== 'string') {
        throw new Error(`${field} must be a valid string URL or null`);
      }
      if (!value.startsWith('https://')) {
        throw new Error(`${field} must be a secure HTTPS URL`);
      }
      try {
        new URL(value);
      } catch (e) {
        throw new Error(`${field} must be a valid URL`);
      }
      return true;
    });
};

export const updateProfileValidator = [
  body('firstName')

    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid ISO 8601 date (YYYY-MM-DD)')
    .custom((value) => {
      const dob = new Date(value);
      if (dob > new Date()) {
        throw new Error('Date of birth cannot be in the future');
      }
      return true;
    }),
  validateHttpsUrlOrNull('profilePicture')
];

export const changePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters long')
    .matches(strongPasswordRegex)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('New passwords do not match');
      }
      return true;
    })
];

export const changeEmailValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please specify a valid email address')
    .normalizeEmail()
];

export const changePhoneValidator = [
  body('phone')
    .custom((value) => {
      if (value === null) return true;
      if (typeof value !== 'string') {
        throw new Error('Phone must be a valid string or null');
      }
      const e164Regex = /^\+[1-9]\d{1,14}$/;
      if (!e164Regex.test(value)) {
        throw new Error('Phone number must be in E.164 international format (e.g. +919999999999)');
      }
      return true;
    })
];

export const changeProfilePictureValidator = [
  validateHttpsUrlOrNull('profilePicture')
];
