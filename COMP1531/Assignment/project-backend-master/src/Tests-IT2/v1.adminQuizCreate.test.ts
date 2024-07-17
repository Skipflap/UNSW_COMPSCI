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

const quizListing = (token: number) => {
  const res = request('GET', SERVER_URL + '/v1/admin/quiz/list',
    {
      qs: { token: token }
    });
  return JSON.parse(res.body.toString());
};

describe('Error tests', () => {
  test.each([
    {
      error: 'Name contains invalid characters', name: '!@#$%^&*()_+-=', description: 'valid description',
    },
    {
      error: 'Name is less than 3 characters long', name: 'aa', description: 'valid description',
    },
    {
      error: 'Name is more than 30 characters long', name: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', description: 'valid description',
    },
  ])("Error: '$error'", ({ name, description }) => {
    const testtoken = userCreate();
    const adminQuizCreateResponse = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: testtoken.token,
        name: name,
        description: description
      }
    });
    expect(adminQuizCreateResponse.statusCode).toStrictEqual(400);
    const adminQuizCreateJson = JSON.parse(adminQuizCreateResponse.body.toString());
    expect(adminQuizCreateJson).toStrictEqual({ error: expect.any(String) });
  });
  test('Error: Description is more than 100 characters in length', () => {
    const testtoken = userCreate();
    const invalidDescription = 'x'.repeat(101);
    const adminQuizCreateResponse = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: testtoken.token,
        name: 'asdf',
        description: invalidDescription
      }
    });
    expect(adminQuizCreateResponse.statusCode).toStrictEqual(400);
    const adminQuizCreateJson = JSON.parse(adminQuizCreateResponse.body.toString());
    expect(adminQuizCreateJson).toStrictEqual({ error: expect.any(String) });
  });
  test('Error: Same name', () => {
    const testtoken = userCreate();
    request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: testtoken.token,
        name: 'asdf',
        description: 'asdf'
      }
    });
    const adminQuizCreateResponse = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: testtoken.token,
        name: 'asdf',
        description: 'asdf'
      }
    });
    expect(adminQuizCreateResponse.statusCode).toStrictEqual(400);
    const adminQuizCreateJson = JSON.parse(adminQuizCreateResponse.body.toString());
    expect(adminQuizCreateJson).toStrictEqual({ error: expect.any(String) });
  });
  test.each([
    {
      error: 'Token empty', token: ''
    },
    {
      error: 'Token invalid', token: '-1'
    }
  ])("Error: '$error'", (token) => {
    userCreate();
    const adminQuizCreateResponse = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: token,
        name: 'valid name',
        description: 'valid description'
      }
    });
    expect(adminQuizCreateResponse.statusCode).toStrictEqual(401);
    const adminQuizCreateJson = JSON.parse(adminQuizCreateResponse.body.toString());
    expect(adminQuizCreateJson).toStrictEqual({ error: expect.any(String) });
  });
});

describe('Correct tests', () => {
  test('Correct return', () => {
    const testtoken = userCreate();
    const adminQuizCreateResponse = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: testtoken.token,
        name: 'valid name',
        description: 'valid description'
      }
    });
    expect(adminQuizCreateResponse.statusCode).toStrictEqual(200);
    const adminQuizCreateJson = JSON.parse(adminQuizCreateResponse.body.toString());
    expect(adminQuizCreateJson).toStrictEqual({ quizId: expect.any(Number) });
  });
  test('Correct behaviour one quiz', () => {
    const testtoken = userCreate();
    const adminQuizCreateResponse = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: testtoken.token,
        name: 'valid name',
        description: 'valid description'
      }
    });
    const quizId = JSON.parse(adminQuizCreateResponse.body.toString());
    expect(quizListing(parseInt(testtoken.token))).toStrictEqual({
      quizzes: [
        {
          quizId: quizId.quizId,
          name: 'valid name'
        }
      ]
    });
  });
  test('Correct behaviour two quizzes one user', () => {
    const testtoken = userCreate();
    const adminQuizCreateResponse1 = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: testtoken.token,
        name: 'valid name1',
        description: 'valid description'
      }
    });
    const quizId1 = JSON.parse(adminQuizCreateResponse1.body.toString());
    const adminQuizCreateResponse2 = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: testtoken.token,
        name: 'valid name2',
        description: 'valid description'
      }
    });
    const quizId2 = JSON.parse(adminQuizCreateResponse2.body.toString());
    expect(quizListing(parseInt(testtoken.token))).toStrictEqual({
      quizzes: [
        {
          quizId: quizId1.quizId,
          name: 'valid name1'
        },
        {
          quizId: quizId2.quizId,
          name: 'valid name2'
        }
      ]
    });
  });
  test('Correct behaviour two users one quiz each', () => {
    const testtoken1 = userCreate();
    const testtoken2 = userCreate();
    const adminQuizCreateResponse1 = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: testtoken1.token,
        name: 'valid name1',
        description: 'valid description'
      }
    });
    request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: testtoken2.token,
        name: 'valid name2',
        description: 'valid description'
      }
    });
    const quizId1 = JSON.parse(adminQuizCreateResponse1.body.toString());
    expect(quizListing(parseInt(testtoken1.token))).toStrictEqual({
      quizzes: [
        {
          quizId: quizId1.quizId,
          name: 'valid name1'
        }
      ]
    });
  });
});
