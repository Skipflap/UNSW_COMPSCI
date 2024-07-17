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
    const sessiontoken = userCreate();
    const sessiontoken1 = userCreate1();
    const quizId = quizCreate(sessiontoken.token);
    quizCreate1(sessiontoken1.token);
    const adminQuizTransferResponse = request('POST', SERVER_URL + '/v1/admin/quiz/' + quizId.quizId.toString() + '/transfer',
      {
        json: { token: token, userEmail: 'asdf.asdf@unsw.edu.au' },
        qs: { quizId: quizId.quizId }
      });
    expect(adminQuizTransferResponse.statusCode).toStrictEqual(401);
    const adminQuizTransferJson = JSON.parse(adminQuizTransferResponse.body.toString());
    expect(adminQuizTransferJson).toStrictEqual({ error: expect.any(String) });
  });
  test.each([
    {
      error: 'userEmail not real user', email: 'dfkdsfksdfkd@gmail.com'
    },
    {
      error: 'userEmail currently logged in', email: 'hayden.smith@unsw.edu.au'
    }
  ])("Error: '$error'", (email) => {
    const sessiontoken = userCreate();
    const sessiontoken1 = userCreate1();
    const quizId = quizCreate(sessiontoken.token);
    quizCreate1(sessiontoken1.token);
    const adminQuizTransferResponse = request('POST', SERVER_URL + '/v1/admin/quiz/' + quizId.quizId.toString() + '/transfer',
      {
        json: { token: sessiontoken.token, userEmail: email }
      });
    expect(adminQuizTransferResponse.statusCode).toStrictEqual(400);
    const adminQuizTransferJson = JSON.parse(adminQuizTransferResponse.body.toString());
    expect(adminQuizTransferJson).toStrictEqual({ error: expect.any(String) });
  });
  test('Error: name of imported quiz already exists', () => {
    const sessiontoken = userCreate();
    const quizResponse = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        token: sessiontoken.token,
        name: 'ASDFASDF',
        description: 'valid description'
      }
    });
    const sessiontoken1 = userCreate1();
    const quizId = JSON.parse(quizResponse.body.toString());
    quizCreate1(sessiontoken1.token);
    const adminQuizTransferResponse = request('POST', SERVER_URL + '/v1/admin/quiz/' + quizId.quizId.toString() + '/transfer',
      {
        json: { token: sessiontoken.token, userEmail: 'asdf.asdf@unsw.edu.au' }
      });
    expect(adminQuizTransferResponse.statusCode).toStrictEqual(400);
    const adminQuizTransferJson = JSON.parse(adminQuizTransferResponse.body.toString());
    expect(adminQuizTransferJson).toStrictEqual({ error: 'Other user already has quiz with the same name' });
  });
  test('Error: quiz ID invalid', () => {
    const sessiontoken = userCreate();
    const sessiontoken1 = userCreate1();
    quizCreate(sessiontoken.token);
    quizCreate1(sessiontoken1.token);
    const adminQuizTransferResponse = request('POST', SERVER_URL + '/v1/admin/quiz/' + '-1' + '/transfer',
      {
        json: { token: sessiontoken.token, userEmail: 'asdf.asdf@unsw.edu.au' }
      });
    expect(adminQuizTransferResponse.statusCode).toStrictEqual(403);
    const adminQuizTransferJson = JSON.parse(adminQuizTransferResponse.body.toString());
    expect(adminQuizTransferJson).toStrictEqual({ error: expect.any(String) });
  });
});

describe('Correct tests', () => {
  test('Correct return', () => {
    const sessiontoken = userCreate();
    const quizId = quizCreate(sessiontoken.token);
    const sessiontoken1 = userCreate1();
    quizCreate1(sessiontoken1.token);
    const adminQuizTransferResponse = request('POST', SERVER_URL + '/v1/admin/quiz/' + quizId.quizId.toString() + '/transfer',
      {
        json: { token: sessiontoken.token, userEmail: 'asdf.asdf@unsw.edu.au' }
      });
    const adminQuizTransferJson = JSON.parse(adminQuizTransferResponse.body.toString());
    expect(adminQuizTransferJson).toStrictEqual({});
  });
  test('Correct behaviour', () => {
    const sessiontoken = userCreate();
    const quizId = quizCreate(sessiontoken.token);
    const sessiontoken1 = userCreate1();
    quizCreate1(sessiontoken1.token);
    request('POST', SERVER_URL + '/v1/admin/quiz/' + quizId.quizId.toString() + '/transfer',
      {
        json: { token: sessiontoken.token, userEmail: 'asdf.asdf@unsw.edu.au' }
      });
    const adminUserDetailsResponse = request('GET', SERVER_URL + '/v1/admin/user/details',
      {
        qs: { token: sessiontoken.token }
      }
    );
    const adminQuizInfoResponse = request('GET', `${SERVER_URL}/v1/admin/quiz/${quizId.quizId}`, {
      qs: { token: sessiontoken.testtoken }
    });
    const adminUserDetailsJSON = JSON.parse(adminUserDetailsResponse.body.toString());
    const adminQuizInfoJson = JSON.parse(adminQuizInfoResponse.body.toString());
    expect(adminQuizInfoJson.creatorId).toStrictEqual(adminUserDetailsJSON.userId);
  });
});
