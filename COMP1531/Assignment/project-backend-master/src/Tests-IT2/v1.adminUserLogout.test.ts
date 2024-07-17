import request from 'sync-request-curl';

import { port, url } from '../config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  request('DELETE', `${SERVER_URL}/v1/clear`);
});

describe('error return adminAuthLogout', () => {
  test('error: invalid token', () => {
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
      'POST',
      SERVER_URL + '/v1/admin/auth/logout',

      // Not necessary, since it's empty, though reminder that
      // GET/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          token: data.token + 1
        }
      }
    );
    expect(answer.statusCode).toBe(401);
    const reply = JSON.parse(answer.body.toString());
    expect(reply).toStrictEqual({ error: expect.any(String) });
  });
  test('error: missing token', () => {
    // const res = request(
    //   'POST',
    //   SERVER_URL + '/v1/admin/auth/register',

    //   // Not necessary, since it's empty, though reminder that
    //   // GET/DELETE is `qs`, PUT/POST is `json`
    //   {
    //     json: {
    //       email: 'hayden.smith@unsw.edu.au',
    //       password: 'haydensmith123',
    //       nameFirst: 'Hayden',
    //       nameLast: 'Smith'
    //     }
    //   }
    // );
    // const data = JSON.parse(res.body.toString());
    const answer = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/logout',

      // Not necessary, since it's empty, though reminder that
      // GET/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          token: ''
        }
      }
    );
    expect(answer.statusCode).toBe(401);
    const reply = JSON.parse(answer.body.toString());
    expect(reply).toStrictEqual({ error: expect.any(String) });
  });
});

describe('success adminAuthLogout', () => {
  test('succesful run', () => {
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
      'POST',
      SERVER_URL + '/v1/admin/auth/logout',
      // Not necessary, since it's empty, though reminder that
      // GET/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          token: data.token
        }
      }
    );
    const result = JSON.parse(answer.body.toString());
    expect(result).toStrictEqual({});
  });
});
