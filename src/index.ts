require('dotenv').config();

import express from 'express';
import cookieSession from 'cookie-session';

import { UserRouter } from './routes/user';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);

app.use('/api', UserRouter);

if (process.env.NODE_ENV !== 'test') {
  app.listen(8000, () => console.log(`Listening on port 8000`));
}

export { app };
