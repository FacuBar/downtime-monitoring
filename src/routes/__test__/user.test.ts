import request from 'supertest';
import { app } from '../../index';
import { User } from '../../models/user';
import { LoginCookie } from '../../test/setup';

/**
 * Tests for /api/register
 */
it('should return 400 if registering with an already in use email', async () => {
  await request(app)
    .post('/api/register')
    .send({
      name: 'Oscaar Isaac',
      email: 'Oscar@Isaac.com',
      password: 'password',
      passwordConfirmation: 'password',
    })
    .expect(201);

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

it('should set a cookie after successfull login', async () => {
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

it('should return 400 on bad request', async () => {
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

/**
 * Tests for /api/login
 */
it('should return cookie if given valid credentials', async () => {
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

it('should return 400 if not given valid credentials', async () => {
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

  await request(app)
    .post('/api/login')
    .send({
      password: 'password',
    })
    .expect(400);

  await request(app)
    .post('/api/login')
    .send({
      password: 'password',
    })
    .expect(400);
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
