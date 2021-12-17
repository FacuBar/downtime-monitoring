import { sign } from 'jsonwebtoken';
import mongoose from 'mongoose';
import { NextFunction, Request, Response } from 'express';
import { requiresAuth } from '../requires-auth';

describe('Auth middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
    };
  });

  test('without cookie', () => {
    const expectedResponse = {
      error: 'no authorization cookie provided',
    };

    requiresAuth(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.json).toBeCalledWith(expectedResponse);
  });

  test('with invalid cookie', () => {
    const expectedResponse = {
      error: 'unauthorized',
    };
    mockRequest.session = {
      jwt: sign(
        {
          id: new mongoose.Types.ObjectId(),
          email: 'oscar@isaac.com',
        },
        'not the same key'
      ),
    };

    requiresAuth(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.json).toBeCalledWith(expectedResponse);
  });

  test('with valid jwt cookie', async () => {
    const payload = {
      id: new mongoose.Types.ObjectId(),
      email: 'oscaar@isaac.com',
    };

    mockRequest.session = { jwt: sign(payload, process.env.JWT_KEY!) };

    requiresAuth(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockRequest.currentUser!.email).toEqual(payload.email);
    expect(mockRequest.currentUser!.id).toEqual(payload.id.toString());
  });
});
