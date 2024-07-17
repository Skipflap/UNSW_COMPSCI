import request from 'sync-request-curl';

import { port, url } from '../config.json';
import { requestAuthRegister, requestQuizCreateV2, requestQuizList } from './wrappers';
import HTTPError from 'http-errors';

const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  request('DELETE', `${SERVER_URL}/v1/clear`);
});

afterAll(() => {
  request('DELETE', `${SERVER_URL}/v1/clear`);
});

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
    const testtoken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    expect(() => requestQuizCreateV2(testtoken.token, name, description).toThrow(HTTPError[400]));
  });
  test('Error: Description is more than 100 characters in length', () => {
    const testtoken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const invalidDescription = 'x'.repeat(101);
    expect(() => requestQuizCreateV2(testtoken.token, 'asdf', invalidDescription).toThrow(HTTPError[400]));
  });
  test('Error: Same name', () => {
    const testtoken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    requestQuizCreateV2(testtoken.token, 'asdf', 'asdf');
    expect(() => requestQuizCreateV2(testtoken.token, 'asdf', 'asdf').toThrow(HTTPError[400]));
  });
  test.each([
    {
      error: 'Token empty', tokens: ''
    },
    {
      error: 'Token invalid', tokens: '-1'
    }
  ])("Error: '$error'", ({ tokens }) => {
    requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    expect(() => requestQuizCreateV2(tokens, 'valid name', 'valid description').toThrow(HTTPError[401]));
  });
});

describe('Correct tests', () => {
  test('Correct return', () => {
    const testtoken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    expect(requestQuizCreateV2(testtoken.token, 'valid name', 'valid description')).toStrictEqual({ quizId: expect.any(Number) });
  });
  test('Correct behaviour one quiz', () => {
    const testtoken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const adminQuizCreateResponse = requestQuizCreateV2(testtoken.token, 'valid name', 'valid description');
    const quizId = adminQuizCreateResponse.quizId;
    expect(requestQuizList(testtoken.token)).toStrictEqual({
      quizzes: [
        {
          quizId: quizId,
          name: 'valid name'
        }
      ]
    });
  });
  test('Correct behaviour two quizzes one user', () => {
    const testtoken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const adminQuizCreateResponse1 = requestQuizCreateV2(testtoken.token, 'valid name1', 'valid description');
    const quizId1 = adminQuizCreateResponse1.quizId;
    const adminQuizCreateResponse2 = requestQuizCreateV2(testtoken.token, 'valid name2', 'valid description');
    const quizId2 = adminQuizCreateResponse2.quizId;
    expect(requestQuizList(testtoken.token)).toStrictEqual({
      quizzes: [
        {
          quizId: quizId1,
          name: 'valid name1'
        },
        {
          quizId: quizId2,
          name: 'valid name2'
        }
      ]
    });
  });
  test('Correct behaviour two users one quiz each', () => {
    const testtoken1 = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const testtoken2 = requestAuthRegister('asdf.asdf@unsw.edu.au', 'VeryStr0ngPassword', 'ASDF', 'ASDF');
    const adminQuizCreateResponse1 = requestQuizCreateV2(testtoken1.token, 'valid name1', 'valid description');
    const adminQuizCreateResponse2 = requestQuizCreateV2(testtoken2.token, 'valid name2', 'valid description');
    const quizId1 = adminQuizCreateResponse1.quizId;
    const quizId2 = adminQuizCreateResponse2.quizId;
    expect(requestQuizList(testtoken1.token)).toStrictEqual({
      quizzes: [
        {
          quizId: quizId1,
          name: 'valid name1'
        }
      ]
    });
    expect(requestQuizList(testtoken2.token)).toStrictEqual({
      quizzes: [
        {
          quizId: quizId2,
          name: 'valid name2'
        }
      ]
    });
  });
});
