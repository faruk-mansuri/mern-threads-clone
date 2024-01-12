import { body, param, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../errors/customError.js';
import User from '../models/UserModel.js';
import Post from '../models/PostModal.js';

const withValidationErrors = (validateValues) => {
  return [
    validateValues,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        if (errorMessages[0].startsWith('no post')) {
          throw new NotFoundError(errorMessages);
        }
        throw new BadRequestError(errorMessages);
      }
      next();
    },
  ];
};

export const validateRegisterInput = withValidationErrors([
  body('name')
    .notEmpty()
    .withMessage('name is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('your name should have min and max length between 3-50'),
  body('username')
    .notEmpty()
    .withMessage('username is required')
    .matches(/^(?=.{3,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/)
    .withMessage('Username invalid')
    .custom(async (username) => {
      const user = await User.findOne({ username });
      if (user) {
        throw new BadRequestError('username already exists');
      }
    }),
  body('email')
    .notEmpty()
    .withMessage('email is required')
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) {
        throw new BadRequestError('email already exists');
      }
    })
    .isEmail()
    .withMessage('invalid email format'),
  body('password')
    .notEmpty()
    .withMessage('please provide password')
    .isLength({ min: 8 })
    .withMessage('password must be at least 8 characters long'),
]);

export const validateLoginInput = withValidationErrors([
  body('username').notEmpty().withMessage('username is required'),
  body('password').notEmpty().withMessage('please provide password'),
]);

export const updateUserInput = withValidationErrors([
  body('name')
    .notEmpty()
    .withMessage('name is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('your name should have min and max length between 3-50'),
  body('email')
    .notEmpty()
    .withMessage('email is required')
    .custom(async (email, { req }) => {
      const user = await User.findOne({ email });
      if (user && user._id.toString() !== req.user.userId) {
        throw new BadRequestError('email already exists');
      }
    })
    .isEmail()
    .withMessage('invalid email format'),
]);

export const createPostInput = withValidationErrors([
  body('text')
    .notEmpty()
    .withMessage('text is required')
    .isLength({ min: 2, max: 500 })
    .withMessage('your text should have min and max length between 2-500'),
]);

// *****
// POST
// *****
export const validatePostIdParam = withValidationErrors([
  param('postId').custom(async (value, { req }) => {
    const isValidId = mongoose.Types.ObjectId.isValid(value);
    if (!isValidId) {
      throw new BadRequestError('invalid mondoDB ID'); //does not matter BadRequestError or Error since we setting error in validateJobInput
    }
    const post = await Post.findById(value);
    if (!post) throw new NotFoundError(`no post with id ${value}`);
  }),
]);

export const replyInput = withValidationErrors([
  body('text')
    .notEmpty()
    .withMessage('text is required')
    .isLength({ min: 2, max: 500 })
    .withMessage('your text should have min and max length between 2-500'),
  param('postId').custom(async (value, { req }) => {
    const isValidId = mongoose.Types.ObjectId.isValid(value);
    if (!isValidId) {
      throw new BadRequestError('invalid mondoDB ID'); //does not matter BadRequestError or Error since we setting error in
    }
    const post = await Post.findById(value);
    if (!post) throw new NotFoundError(`no post with id ${value}`);
  }),
]);

// CONVERSATION
export const validateOtherUserIdParam = withValidationErrors([
  param('otherUserId').custom(async (value, { req }) => {
    const isValidId = mongoose.Types.ObjectId.isValid(value);
    if (!isValidId) {
      throw new BadRequestError('invalid mondoDB ID'); //does not matter BadRequestError or Error since we setting error in
    }
  }),
]);
