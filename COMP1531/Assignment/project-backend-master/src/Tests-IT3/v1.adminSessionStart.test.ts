import HTTPError from 'http-errors';
import { requestAuthRegister, requestQuizCreateV2, requestSessionStart, requestTrashQuizV2, requestSessionView, requestCreateQuizQuestionV2, requestClear } from './wrappers';

const validAutoStartNum = 3;
const maximumSessions = 10;

beforeEach(() => {
  requestClear();
});
afterAll(() => {
  requestClear();
});

const questionCreate = (testtoken: string, quizId: number) => {
  return requestCreateQuizQuestionV2(
    testtoken,
    quizId,
    {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Samuel Harland',
          correct: false
        }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    });
};

describe('Error Tests', () => {
  test('autoStartNum is a number greater than 50', () => {
    const userToken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const quizId = requestQuizCreateV2(userToken.token, 'valid name', 'valid description');
    questionCreate(userToken.token, quizId.quizId);
    expect(() => requestSessionStart(userToken.token, 51, quizId.quizId)).toThrow(HTTPError[400]);
  });
  test('Maximum of 10 sessions that are not in END state', () => {
    const userToken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const quizId = requestQuizCreateV2(userToken.token, 'valid name', 'valid description');
    questionCreate(userToken.token, quizId.quizId);
    for (let i = 0; i <= maximumSessions; i++) {
      requestSessionStart(userToken.token, validAutoStartNum, quizId.quizId);
    }
    expect(() => requestSessionStart(userToken.token, validAutoStartNum, quizId.quizId)).toThrow(HTTPError[400]);
  });
  test('Quiz does not have any questions', () => {
    const userToken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const quizId = requestQuizCreateV2(userToken.token, 'valid name', 'valid description');
    expect(() => requestSessionStart(userToken.token, 5, quizId.quizId)).toThrow(HTTPError[400]);
  });
  test('The quiz is in trash', () => {
    const userToken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const quizId = requestQuizCreateV2(userToken.token, 'valid name', 'valid description');
    questionCreate(userToken.token, quizId.quizId);
    requestTrashQuizV2(quizId.quizId, userToken.token);
    expect(() => requestSessionStart(userToken.token, validAutoStartNum, quizId.quizId)).toThrow(HTTPError[400]);
  });
  test.each([
    {
      error: 'Token empty', token: ''
    },
    {
      error: 'Token invalid', token: '-1'
    }
  ])("Error: '$error'", ({ token }) => {
    const userToken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const quizId = requestQuizCreateV2(userToken.token, 'valid name', 'valid description');
    questionCreate(userToken.token, quizId.quizId);
    expect(() => requestSessionStart(token, validAutoStartNum, quizId.quizId)).toThrow(HTTPError[401]);
  });
  test('Error: quiz ID invalid', () => {
    const userToken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const quizId = requestQuizCreateV2(userToken.token, 'valid name', 'valid description');
    questionCreate(userToken.token, quizId.quizId);
    expect(() => requestSessionStart(userToken.token, validAutoStartNum, -1)).toThrow(HTTPError[403]);
  });
});

describe('Correct tests', () => {
  test('Correct return', () => {
    const userToken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const quizId = requestQuizCreateV2(userToken.token, 'valid name', 'valid description');
    questionCreate(userToken.token, quizId.quizId);
    expect(requestSessionStart(userToken.token, validAutoStartNum, quizId.quizId)).toStrictEqual({ sessionId: expect.any(Number) });
  });
  test('Correct behaviour', () => {
    const userToken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const quizId = requestQuizCreateV2(userToken.token, 'valid name', 'valid description');
    questionCreate(userToken.token, quizId.quizId);
    const sessionId = requestSessionStart(userToken.token, validAutoStartNum, quizId.quizId);
    const sessionView = requestSessionView(userToken.token, quizId.quizId);
    expect(sessionView.activeSessions).toStrictEqual([sessionId.sessionId]);
  });
});
