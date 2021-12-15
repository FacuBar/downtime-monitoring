import express from 'express';
import cookieSession from 'cookie-session';

import { UserRouter } from './routes/user';

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

app.listen(8000, () => {
  console.log('listening on port 8000');
});
