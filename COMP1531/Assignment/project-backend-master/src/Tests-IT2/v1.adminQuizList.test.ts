import request from 'sync-request-curl';

import { port, url } from '../config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  request('DELETE', `${SERVER_URL}/v1/clear`);
});

afterAll(() => {
  request('DELETE', `${SERVER_URL}/v1/clear`);
});

const userCreate = () => {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: {
      email: 'hayden.smith@unsw.edu.au',
      password: 'haydensmith123',
      nameFirst: 'Hayden',
      nameLast: 'Smith'
    }
  });
  return JSON.parse(res.body.toString());
};

const userCreate1 = () => {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: {
      email: 'asdf.asdf@unsw.edu.au',
      password: 'VeryStr0ngPassword',
      nameFirst: 'ASDF',
      nameLast: 'ASDF'
    }
  });
  return JSON.parse(res.body.toString());
};

const quizCreate = (testtoken: string) => {
  const res = request('POST', SERVER_URL + '/v1/admin/quiz', {
    json: {
      token: testtoken,
      name: 'valid name',
      description: 'valid description'
    }
  });
  return JSON.parse(res.body.toString());
};

const quizCreate1 = (testtoken: string) => {
  const res = request('POST', SERVER_URL + '/v1/admin/quiz', {
    json: {
      token: testtoken,
      name: 'ASDFASDF',
      description: 'valid description'
    }
  });
  return JSON.parse(res.body.toString());
};

describe('Error tests', () => {
  test.each([
    {
      error: 'Token empty', token: ''
    },
    {
      error: 'Token invalid', token: '-1'
    }
  ])("Error: '$error'", (token) => {
    userCreate();
    const adminQuizListResponse = request('GET', SERVER_URL + '/v1/admin/quiz/list',
      {
        qs: { token: token }
      });
    expect(adminQuizListResponse.statusCode).toStrictEqual(401);
    const adminQuizListJson = JSON.parse(adminQuizListResponse.body.toString());
    expect(adminQuizListJson).toStrictEqual({ error: expect.any(String) });
  });
});

describe('Correct Tests', () => {
  test('Correct return one quiz', () => {
    const sessiontoken = userCreate();
    const quizId = quizCreate(sessiontoken.token);
    const adminQuizListResponse = request('GET', SERVER_URL + '/v1/admin/quiz/list',
      {
        qs: { token: sessiontoken.token }
      });
    expect(adminQuizListResponse.statusCode).toStrictEqual(200);
    const adminQuizListJson = JSON.parse(adminQuizListResponse.body.toString());
    expect(adminQuizListJson).toStrictEqual({
      quizzes: [
        {
          quizId: quizId.quizId,
          name: 'valid name'
        }
      ]
    });
  });
  test('Correct return one quiz two users', () => {
    const sessiontoken = userCreate();
    const sessiontoken1 = userCreate1();
    const quizId = quizCreate(sessiontoken.token);
    const quizId1 = quizCreate1(sessiontoken1.token);
    const adminQuizListResponse = request('GET', SERVER_URL + '/v1/admin/quiz/list',
      {
        qs: { token: sessiontoken.token }
      });
    const adminQuizListJson = JSON.parse(adminQuizListResponse.body.toString());
    expect(adminQuizListJson).toStrictEqual({
      quizzes: [
        {
          quizId: quizId.quizId,
          name: 'valid name'
        }
      ]
    });
    const adminQuizListResponse1 = request('GET', SERVER_URL + '/v1/admin/quiz/list',
      {
        qs: { token: sessiontoken1.token }
      });
    const adminQuizListJson1 = JSON.parse(adminQuizListResponse1.body.toString());
    expect(adminQuizListJson1).toStrictEqual({
      quizzes: [
        {
          quizId: quizId1.quizId,
          name: 'ASDFASDF'
        }
      ]
    });
  });
  test('Correct return two quizzes', () => {
    const sessiontoken = userCreate();
    const quizId = quizCreate(sessiontoken.token);
    const quizId1 = quizCreate1(sessiontoken.token);
    const adminQuizListResponse = request('GET', SERVER_URL + '/v1/admin/quiz/list',
      {
        qs: { token: sessiontoken.token }
      });
    const adminQuizListJson = JSON.parse(adminQuizListResponse.body.toString());
    expect(adminQuizListJson).toStrictEqual({
      quizzes: [
        {
          quizId: quizId.quizId,
          name: 'valid name'
        },
        {
          quizId: quizId1.quizId,
          name: 'ASDFASDF'
        }
      ]
    });
  });
});
