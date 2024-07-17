// import request from 'sync-request-curl';
// import { port, url } from '../src/config.json';
import HTTPError from 'http-errors';
import { requestClear, requestAuthRegister, adminAuthLogoutV2 } from './wrappers';

// const SERVER_URL = `${url}:${port}`;

// Tests
let token1: string;

beforeEach(() => {
  requestClear();
  token1 = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith').token;
});

describe('Errors', () => {
  test('Error 401 - invalid token', () => {
    expect(() => adminAuthLogoutV2(token1 + 1)).toThrow(HTTPError[401]);
  });
  test('Error 401 - empty token', () => {
    expect(() => adminAuthLogoutV2('')).toThrow(HTTPError[401]);
  });
});

describe('Successful Run 200', () => {
  test('success', () => {
    expect(() => adminAuthLogoutV2(token1)).not.toThrow();
  });
});
