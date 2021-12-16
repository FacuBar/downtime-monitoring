import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/user';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post(
  '/register',
  [
    body('name').notEmpty().isString().withMessage('invalid name'),
    body('email')
      .notEmpty()
      .isEmail()
      .withMessage('invalid email')
      .custom(async (value) => {
        const existingUser = await User.findOne({ value });

        if (existingUser) {
          throw new Error('Email already on use');
        }
        return true;
      }),
    body('password')
      .trim()
      .notEmpty()
      .isString()
      .isLength({ min: 6 })
      .withMessage('password must be 6 characters or longer'),
    body('passwordConfirmation').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json(errors);
      return;
    }

    const { name, email, password } = req.body;

    const user = User.build({ name, email, password });
    await user.save();

    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!,
      {
        expiresIn: +process.env.JWT_EXPIRES_IN!,
      }
    );

    req.session = {
      jwt: userJwt,
    };

    res.status(201).json(user);
  }
);

router.post('/login', async (req: Request, res: Response) => {});

export { router as UserRouter };
