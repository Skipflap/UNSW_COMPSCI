// import request from 'sync-request-curl';
// import { port, url } from '../src/config.json';
import HTTPError from 'http-errors';
import { requestClear, requestAuthRegister, adminUserDetailsV2 } from './wrappers';

// const SERVER_URL = `${url}:${port}`;

// Tests
let token1: string;
//  quizId1: number, secondquizId1: number;
// let token2: string;

beforeEach(() => {
  requestClear();

  token1 = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith').token;
});

describe('Errors', () => {
  test('Error 401 - name of restored quiz is taken by another active quiz', () => {
    expect(() => adminUserDetailsV2(token1 + 1)).toThrow(HTTPError[401]);
  });
});

describe('Successful Run 200', () => {
  test('success', () => {
    expect(adminUserDetailsV2(token1)).toStrictEqual({
      user: {
        userId: 0,
        name: 'Hayden Smith',
        email: 'hayden.smith@unsw.edu.au',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
  });
});
