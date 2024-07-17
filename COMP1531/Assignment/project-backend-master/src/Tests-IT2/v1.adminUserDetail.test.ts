import request from 'sync-request-curl';

import { port, url } from '../config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  request('DELETE', `${SERVER_URL}/v1/clear`);
});

describe('error return adminUserDetail', () => {
  test('invalid token', () => {
    const res = request(
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
    const data = JSON.parse(res.body.toString());
    const answer = request(
      'GET',
      SERVER_URL + '/v1/admin/user/details',

      // Not necessary, since it's empty, though reminder that
      // GET/DELETE is `qs`, PUT/POST is `json`
      {
        qs: {
          token: data.token + 1
        }
      }
    );
    expect(answer.statusCode).toBe(401);
    const reply = JSON.parse(answer.body.toString());
    expect(reply).toStrictEqual({ error: expect.any(String) });
  });
});

describe('success adminUserDetail', () => {
  test('succesfull run', () => {
    const res = request(
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
    const data = JSON.parse(res.body.toString());
    const answer = request(
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
    const reply = JSON.parse(answer.body.toString());
    expect(reply).toStrictEqual({
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
