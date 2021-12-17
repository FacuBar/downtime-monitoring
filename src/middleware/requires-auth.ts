import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

interface UserPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

const requiresAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.jwt) {
    res.statusCode = 401;
    res.json({ error: 'no authorization cookie provided' });
    return;
  }

  try {
    const payload = verify(
      req.session.jwt,
      process.env.JWT_KEY!
    ) as UserPayload;
    req.currentUser = payload;
  } catch (err) {}

  if (!req.currentUser) {
    res.statusCode = 401;
    res.json({ error: 'unauthorized' });
    return;
  }
  next();
};

export { requiresAuth };
