import request from 'supertest';
import { app } from '../../index';

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
