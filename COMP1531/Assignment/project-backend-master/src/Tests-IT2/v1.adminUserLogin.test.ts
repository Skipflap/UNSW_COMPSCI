import request from 'sync-request-curl';

import { port, url } from '../config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  request('DELETE', `${SERVER_URL}/v1/clear`);
});

describe('error return adminauthDetail', () => {
  test('error: invalid email', () => {
    request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',

      // Not necessary, since it's empty, though reminder that
      // GET/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          email: 'hayden.smith@unsw.edu.au',
          password: 'haydensmith123',
          nameFirst: 'Hayden',
          nameLast: 'Smith'
        }
      }
    );
    const answer = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/login',

      // Not necessary, since it's empty, though reminder that
      // GET/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          email: 'nothayden.smith@unsw.edu.au',
          password: 'haydensmith123'
        }
      }
    );
    expect(answer.statusCode).toBe(400);
    const reply = JSON.parse(answer.body.toString());
    expect(reply).toStrictEqual({ error: expect.any(String) });
  });
  test('error: wrong password', () => {
    request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',

      // Not necessary, since it's empty, though reminder that
      // GET/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          email: 'hayden.smith@unsw.edu.au',
          password: 'haydensmith123',
          nameFirst: 'Hayden',
          nameLast: 'Smith'
        }
      }
    );

    const answer = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/login',

      // Not necessary, since it's empty, though reminder that
      // GET/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          email: 'hayden.smith@unsw.edu.au',
          password: 'wtafaak456'
        }
      }
    );
    expect(answer.statusCode).toBe(400);
    const reply = JSON.parse(answer.body.toString());
    expect(reply).toStrictEqual({ error: expect.any(String) });
  });
});

describe('success adminAuthRegister', () => {
  test('success adminauthLogin', () => {
    const register = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',

      // Not necessary, since it's empty, though reminder that
      // GET/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          email: 'hayden.smith@unsw.edu.au',
          password: 'haydensmith123',
          nameFirst: 'Hayden',
          nameLast: 'Smith'
        }
      }
    );
    const data = JSON.parse(register.body.toString());
    const answer = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/login',

      // Not necessary, since it's empty, though reminder that
      // GET/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          email: 'hayden.smith@unsw.edu.au',
          password: 'haydensmith123'
        }
      }
    );
    const reply = JSON.parse(answer.body.toString());
    expect(reply).toStrictEqual({ token: expect.any(String) });

    const blackbox = request(
      'GET',
      SERVER_URL + '/v1/admin/user/details',

      // Not necessary, since it's empty, though reminder that
      // GET/DELETE is `qs`, PUT/POST is `json`
      {
        qs: {
          token: data.token
        }
      }
    );
    const bbReply = JSON.parse(blackbox.body.toString());
    expect(bbReply).toStrictEqual({
      user: {
        userId: 0,
        name: 'Hayden Smith',
        email: 'hayden.smith@unsw.edu.au',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
  });
});
