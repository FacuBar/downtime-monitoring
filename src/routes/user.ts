import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { compare } from 'bcryptjs';

import { User, UserDoc } from '../models/user';

const router = express.Router();

router.post(
  '/users',
  [
    body('name').notEmpty().isString().withMessage('invalid name'),
    body('email')
      .notEmpty()
      .isEmail()
      .withMessage('invalid email')
      .custom(async (value) => {
        const existingUser = await User.findOne({ email: value });

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
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, email, password } = req.body;

    const user = User.build({ name, email, password });
    await user.save();

    setCookie(user, req);

    res.status(201).json(user);
  }
);

router.post(
  '/users/login',
  [body('email').notEmpty().isEmail(), body('password').notEmpty()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'invalid credentials' });
      return;
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ error: 'invalid credentials' });
      return;
    }

    const validPassword = await compare(password, user.password);
    if (!validPassword) {
      res.status(400).json({ error: 'invalid credentials' });
      return;
    }

    setCookie(user, req);

    res.status(200).json({});
  }
);

router.post('/users/logout', (req, res) => {
  req.session = null;

  res.json({});
});

const setCookie = (user: UserDoc, req: Request) => {
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
};

export { router as UserRouter };
