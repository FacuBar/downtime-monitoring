import request from 'supertest';
import { app } from '../..';
import { User, UserDoc } from '../../models/user';
import { sign } from 'jsonwebtoken';
import mongoose from 'mongoose';

describe('create website alert', () => {
  let user: UserDoc;
  let userId: string;
  let cookie: string[];

  beforeEach(async () => {
    user = User.build({
      name: 'oscar isaac',
      email: 'oscar@isaac.com',
      password: 'password',
    });
    userId = user.id;
    await user.save();

    cookie = createCookie({
      id: userId,
      email: 'oscar@isaac.com',
    });
  });

  test('invalid url', async () => {
    await request(app)
      .post(`/api/users/${userId}/websites`)
      .set('Cookie', cookie)
      .send({ url: 'invalid url' })
      .expect(400);

    await request(app)
      .post(`/api/users/${userId}/websites`)
      .set('Cookie', cookie)
      .send({})
      .expect(400);
  });

  test('unauthorized request', async () => {
    await request(app)
      .post(`/api/users/${userId}/websites`)
      .set(
        'Cookie',
        createCookie({
          id: new mongoose.Types.ObjectId(),
          email: 'notsame@email.com',
        })
      )
      .send({ url: 'google.com' })
      .expect(401);
  });

  test('successful request', async () => {
    await request(app)
      .post(`/api/users/${userId}/websites`)
      .set('Cookie', cookie)
      .send({ url: 'google.com' })
      .expect(201);
  });

  test('add already existent site', async () => {
    await request(app)
      .post(`/api/users/${userId}/websites`)
      .set('Cookie', cookie)
      .send({ url: 'google.com' })
      .expect(201);

    await request(app)
      .post(`/api/users/${userId}/websites`)
      .set('Cookie', cookie)
      .send({ url: 'google.com' })
      .expect(400);
  });
});

describe('update website alert', () => {
  let user: UserDoc;
  let userId: string;
  let cookie: string[];
  let websiteId: string;

  beforeEach(async () => {
    user = User.build({
      name: 'oscar isaac',
      email: 'oscar@isaac.com',
      password: 'password',
    });
    userId = user.id;
    user.addWebsite({ url: 'google.com', notifyTo: user.email });
    websiteId = user.websites[0].id;

    await user.save();

    cookie = createCookie({
      id: userId,
      email: 'oscar@isaac.com',
    });
  });

  test('unauthorized request', async () => {
    const randomId = new mongoose.Types.ObjectId().toString();
    await request(app)
      .put(`/api/users/${userId}/websites/${randomId}`)
      .send({ notify: false })
      .expect(401);

    await request(app)
      .put(`/api/users/${userId}/websites/${randomId}`)
      .set('Cookie', createCookie({ id: randomId, email: 'email@email.com' }))
      .send({ notify: true })
      .expect(401);
  });

  test('bad request', async () => {
    const randomId = new mongoose.Types.ObjectId().toString();
    await request(app)
      .put(`/api/users/${userId}/websites/${websiteId}`)
      .set('Cookie', cookie)
      .send({ monitor: 'verdad' })
      .expect(400);

    await request(app)
      .put(`/api/users/${userId}/websites/${randomId}`)
      .set('Cookie', cookie)
      .send({ monitor: true })
      .expect(400);
  });

  test('successful update', async () => {
    await request(app)
      .put(`/api/users/${userId}/websites/${websiteId}`)
      .set('Cookie', cookie)
      .send({ monitor: false })
      .expect(200);

    const updatedUser = await User.findById(userId);
    expect(updatedUser!.websites[0].monitor).toEqual(false);
  });
});

const createCookie = (payload: any): string[] => {
  const token = sign(payload, process.env.JWT_KEY!);

  const session = { jwt: token };

  const sessionJSON = JSON.stringify(session);

  const base64 = Buffer.from(sessionJSON).toString('base64');

  return [`express:sess=:${base64}`];
};
