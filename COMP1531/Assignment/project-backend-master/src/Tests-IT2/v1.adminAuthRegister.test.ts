import request from 'sync-request-curl';

import { port, url } from '../config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  request('DELETE', `${SERVER_URL}/v1/clear`);
});

describe('error return adminAuthRegister', () => {
  test('invalid first name: wierd charachters', () => {
    const res = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',

      // Not necessary, since it's empty, though reminder that
      // GET/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          email: 'hayden.smith@unsw.edu.au',
          password: 'haydensmith123',
          nameFirst: 'Hayden123',
          nameLast: 'Smith'
        }
      }
    );
    expect(res.statusCode).toBe(400);
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: expect.any(String) });
  });
  test('invalid first name: too long', () => {
    const res = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',

      // Not necessary, since it's empty, though reminder that
      // GET/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          email: 'hayden.smith@unsw.edu.au',
          password: 'haydensmith123',
          nameFirst: 'Hayden why is my name too long mr hayden pls help me',
          nameLast: 'Smith'
        }
      }
    );
    expect(res.statusCode).toBe(400);
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: expect.any(String) });
  });
  test('invalid first name: too short', () => {
    const res = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',

      // Not necessary, since it's empty, though reminder that
      // GET/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          email: 'hayden.smith@unsw.edu.au',
          password: 'haydensmith123',
          nameFirst: 'H',
          nameLast: 'Smith'
        }
      }
    );
    expect(res.statusCode).toBe(400);
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: expect.any(String) });
  });
  test('invalid last name: wierd charachters', () => {
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
          nameLast: 'Smith123'
        }
      }
    );
    expect(res.statusCode).toBe(400);
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: expect.any(String) });
  });
  test('invalid last name: too long ', () => {
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
          nameLast: 'Smithsonian museum is a beutiful museum i think cause ive never been there before'
        }
      }
    );
    expect(res.statusCode).toBe(400);
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: expect.any(String) });
  });
  test('invalid last name: too short', () => {
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
          nameLast: 'S'
        }
      }
    );
    expect(res.statusCode).toBe(400);
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: expect.any(String) });
  });
  test('invalid email', () => {
    const res = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',

      // Not necessary, since it's empty, though reminder that
      // GET/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          email: 'haydensmithman',
          password: 'haydensmith123',
          nameFirst: 'Hayden',
          nameLast: 'Smith'
        }
      }
    );
    expect(res.statusCode).toBe(400);
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: expect.any(String) });
  });
  test('in use email', () => {
    request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',

      // Not necessary, since it's empty, though reminder that
      // GET/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          email: 'hayden.smith@unsw.edu.au',
          password: 'iliketostealotherpeoplesidentity123',
          nameFirst: 'identity theft',
          nameLast: 'Smith'
        }
      }
    );
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
    expect(res.statusCode).toBe(400);
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: expect.any(String) });
  });
  test('invalid password: too short', () => {
    const res = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',

      // Not necessary, since it's empty, though reminder that
      // GET/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          email: 'hayden.smith@unsw.edu.au',
          password: 'imcool',
          nameFirst: 'Hayden',
          nameLast: 'Smith'
        }
      }
    );
    expect(res.statusCode).toBe(400);
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: expect.any(String) });
  });
  test('invalid password: too weak', () => {
    const res = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',

      // Not necessary, since it's empty, though reminder that
      // GET/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          email: 'hayden.smith@unsw.edu.au',
          password: 'haydensmith',
          nameFirst: 'Hayden',
          nameLast: 'Smith'
        }
      }
    );
    expect(res.statusCode).toBe(400);
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: expect.any(String) });
  });
});

describe('success adminAuthRegister', () => {
  test('successful register', () => {
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
    expect(data).toStrictEqual({ token: expect.any(String) });
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
  test('multiple register', () => {
    const user1 = request(
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

    const user2 = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',

      // Not necessary, since it's empty, though reminder that
      // GET/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          email: 'albertEinstein4@gmail.com',
          password: 'albertEinsteinisnumber1',
          nameFirst: 'Albert',
          nameLast: 'Einstein'
        }
      }
    );
    const data1 = JSON.parse(user1.body.toString());
    expect(data1).toStrictEqual({ token: expect.any(String) });
    const data2 = JSON.parse(user2.body.toString());
    expect(data2).toStrictEqual({ token: expect.any(String) });
    const answer = request(
      'GET',
      SERVER_URL + '/v1/admin/user/details',

      // Not necessary, since it's empty, though reminder that
      // GET/DELETE is `qs`, PUT/POST is `json`
      {
        qs: {
          token: data1.token
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

    const answer2 = request(
      'GET',
      SERVER_URL + '/v1/admin/user/details',

      // Not necessary, since it's empty, though reminder that
      // GET/DELETE is `qs`, PUT/POST is `json`
      {
        qs: {
          token: data2.token
        }
      }
    );
    const reply2 = JSON.parse(answer2.body.toString());
    expect(reply2).toStrictEqual({
      user: {
        userId: 1,
        name: 'Albert Einstein',
        email: 'albertEinstein4@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
  });
});
