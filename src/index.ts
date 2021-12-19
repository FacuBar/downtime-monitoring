import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieSession from 'cookie-session';
import mongoose from 'mongoose';

import { UserRouter } from './routes/user';
import { WebsiteRouter } from './routes/website';
import { Reports } from './controllers/cronjob';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    signed: false,
    secure: false,
  })
);

app.use('/api', UserRouter);
app.use('/api', WebsiteRouter);

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log('database connected correctly');
      Reports.loadReportTasks();
    })
    .catch((e) => {
      console.log(e);
    });

  app.listen(5000, () => {
    console.log('Listening on port 5000!');
  });
};

if (process.env.NODE_ENV !== 'test') {
  start();
}

export { app };
