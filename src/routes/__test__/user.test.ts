import request from 'supertest';
import { app } from '../../index';
import { User } from '../../models/user';
import { LoginCookie } from '../../test/setup';

describe('register route', () => {
  test('registeren with already registered email', async () => {
    await User.build({
      name: 'Oscaar Isaac',
      email: 'Oscar@Isaac.com',
      password: 'password',
    }).save();

    await request(app)
      .post('/api/register')
      .send({
        name: 'Oscaar Isaac',
        email: 'Oscar@Isaac.com',
        password: 'password',
        passwordConfirmation: 'password',
      })
      .expect(400);
  });

  test('successful registration', async () => {
    const response = await request(app)
      .post('/api/register')
      .send({
        name: 'Oscaar Isaac',
        email: 'Oscar@Isaac.com',
        password: 'password',
        passwordConfirmation: 'password',
      })
      .expect(201);

    expect(response.get('Set-Cookie')).toBeDefined();
  });

  test('invalid requests', async () => {
    await request(app)
      .post('/api/register')
      .send({
        name: 'Oscaar Isaac',
        email: 'Oscar@Isaac.com',
        password: 'somepassword',
        passwordConfirmation: 'someotherpassword',
      })
      .expect(400);

    await request(app)
      .post('/api/register')
      .send({
        name: '',
        email: 'Oscar@Isaac.com',
        password: 'somepassword',
        passwordConfirmation: 'somepassword',
      })
      .expect(400);

    await request(app)
      .post('/api/register')
      .send({
        name: 'Oscaar Isaac',
        email: 'Oscarnotanemail',
        password: 'somepassword',
        passwordConfirmation: 'somepassword',
      })
      .expect(400);

    await request(app)
      .post('/api/register')
      .send({
        name: 'Oscaar Isaac',
        email: 'oscar@isaac.com',
        password: '',
      })
      .expect(400);
  });
});

describe('login route', () => {
  test('successful login', async () => {
    await User.build({
      name: 'oscar isaac',
      email: 'oscar@isaac.com',
      password: 'password',
    }).save();

    const response = await request(app)
      .post('/api/login')
      .send({
        email: 'oscar@isaac.com',
        password: 'password',
      })
      .expect(200);

    expect(response.get('Set-Cookie')).toBeDefined();
  });

  test('invalid request', async () => {
    await request(app)
      .post('/api/login')
      .send({
        password: 'password',
      })
      .expect(400);

    await request(app)
      .post('/api/login')
      .send({
        email: 'invalidemail',
        password: 'password',
      })
      .expect(400);

    await request(app)
      .post('/api/login')
      .send({
        email: 'password',
      })
      .expect(400);
  });

  test('invalid credentials', async () => {
    await User.build({
      name: 'user',
      email: 'email@email.com',
      password: 'password',
    }).save();

    await request(app)
      .post('/api/login')
      .send({
        email: 'nottheemail@amil.com',
        password: 'password',
      })
      .expect(400);

    await request(app)
      .post('/api/login')
      .send({
        email: 'email@email.com',
        password: 'notthepassword',
      })
      .expect(400);
  });
});

/**
 * Tests for /api/logout
 */
it('should delete cookie if present', async () => {
  const response = await request(app)
    .post('/api/logout')
    .set('Cookie', await LoginCookie())
    .send({})
    .expect(200);

  expect(response.get('Set-Cookie')[0]).toEqual(
    'express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
  );
});
