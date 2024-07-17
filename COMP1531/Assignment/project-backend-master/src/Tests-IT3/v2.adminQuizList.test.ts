import request from 'sync-request-curl';

import { port, url } from '../config.json';
import HTTPError from 'http-errors';
import { requestAuthRegister, requestQuizCreateV2, requestQuizList } from './wrappers';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  request('DELETE', `${SERVER_URL}/v1/clear`);
});

afterAll(() => {
  request('DELETE', `${SERVER_URL}/v1/clear`);
});

const quizCreate = (testtoken: string) => {
  return requestQuizCreateV2(testtoken, 'valid name', 'valid description');
};

const quizCreate1 = (testtoken: string) => {
  return requestQuizCreateV2(testtoken, 'ASDFASDF', 'valid description');
};

describe('Error tests', () => {
  test.each([
    {
      error: 'Token empty', token: ''
    },
    {
      error: 'Token invalid', token: '-1'
    }
  ])("Error: '$error'", ({ token }) => {
    requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    expect(() => requestQuizList(token).toThrow(HTTPError[401]));
  });
});

describe('Correct Tests', () => {
  test('Correct return one quiz', () => {
    const sessiontoken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const quizId = quizCreate(sessiontoken.token);
    expect(requestQuizList(sessiontoken.token)).toStrictEqual({
      quizzes: [
        {
          quizId: quizId.quizId,
          name: 'valid name'
        }
      ]
    });
  });
  test('Correct return one quiz two users', () => {
    const sessiontoken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const sessiontoken1 = requestAuthRegister('asdf.asdf@unsw.edu.au', 'VeryStr0ngPassword', 'ASDF', 'ASDF');
    const quizId = quizCreate(sessiontoken.token);
    const quizId1 = quizCreate1(sessiontoken1.token);
    expect(requestQuizList(sessiontoken.token)).toStrictEqual({
      quizzes: [
        {
          quizId: quizId.quizId,
          name: 'valid name'
        }
      ]
    });
    expect(requestQuizList(sessiontoken1.token)).toStrictEqual({
      quizzes: [
        {
          quizId: quizId1.quizId,
          name: 'ASDFASDF'
        }
      ]
    });
  });
  test('Correct return two quizzes', () => {
    const sessiontoken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const quizId = quizCreate(sessiontoken.token);
    const quizId1 = quizCreate1(sessiontoken.token);
    expect(requestQuizList(sessiontoken.token)).toStrictEqual({
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
