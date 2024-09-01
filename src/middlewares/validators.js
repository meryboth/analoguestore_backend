// /middlewares/validators.js
import { check, validationResult } from 'express-validator';

const validateUserRegistration = [
  check('name')
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters long')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name must contain only alphabets and spaces'),
  check('email').isEmail().withMessage('Email must be valid').normalizeEmail(),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateUserLogin = [
  check('email').isEmail().withMessage('Email must be valid').normalizeEmail(),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export { validateUserRegistration, validateUserLogin };
