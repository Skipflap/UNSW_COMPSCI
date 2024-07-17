import { requestAuthRegister, requestQuizCreateV2, requestCreateQuizQuestionV2, requestSessionStart, requestClear, requestPlayerJoin, requestSessionStateUpdate, requestGetQuizSessionStatus, requestPlayerStatus } from './wrappers';
import HTTPError from 'http-errors';

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

const autoStartNumTest = 3;
const testQuestionBody = {
  question: 'Who is the Monarch of England?',
  duration: 4,
  points: 5,
  answers: [
    {
      answer: 'Prince Charles',
      correct: true,
      colour: 'red',
      answerId: 1
    },
    {
      answer: 'Prince Phillip',
      correct: false,
      colour: 'blue',
      answerId: 2
    }
  ],
  thumbnailUrl: 'http://google.com/some/image/path.jpg'
};

describe('Error tests', () => {
  test('Name of user not unique', () => {
    const testtoken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const testquizid = requestQuizCreateV2(testtoken.token, 'valid name', 'valid description');
    requestCreateQuizQuestionV2(testtoken.token, testquizid.quizId, testQuestionBody);
    const testsessionid = requestSessionStart(testtoken.token, autoStartNumTest, testquizid.quizId);
    requestPlayerJoin('asdf', testsessionid.sessionId);
    expect(() => requestPlayerJoin('asdf', testsessionid.sessionId)).toThrow(HTTPError[400]);
  });
  test('Invalid session id', () => {
    const testtoken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const testquizid = requestQuizCreateV2(testtoken.token, 'valid name', 'valid description');
    requestCreateQuizQuestionV2(testtoken.token, testquizid.quizId, testQuestionBody);
    const testsessionid = requestSessionStart(testtoken.token, autoStartNumTest, testquizid.quizId);
    expect(() => requestPlayerJoin('asdf', testsessionid.sessionId + 1)).toThrow(HTTPError[400]);
  });
  test('Session not in LOBBY state', () => {
    const testtoken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const testquizid = requestQuizCreateV2(testtoken.token, 'valid name', 'valid description');
    requestCreateQuizQuestionV2(testtoken.token, testquizid.quizId, testQuestionBody);
    const testsessionid = requestSessionStart(testtoken.token, autoStartNumTest, testquizid.quizId);
    requestSessionStateUpdate(testtoken.token, testquizid.quizId, testsessionid.sessionId, 'NEXT_QUESTION');
    expect(() => requestPlayerJoin('asdf', testsessionid.sessionId)).toThrow(HTTPError[400]);
  });
});

describe('Correct tests', () => {
  test('Correct return', () => {
    const testtoken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const testquizid = requestQuizCreateV2(testtoken.token, 'valid name', 'valid description');
    requestCreateQuizQuestionV2(testtoken.token, testquizid.quizId, testQuestionBody);
    const testsessionid = requestSessionStart(testtoken.token, autoStartNumTest, testquizid.quizId);
    expect(requestPlayerJoin('asdf', testsessionid.sessionId)).toStrictEqual({ playerId: expect.any(Number) });
  });
  test('Correct behaviour: one player', () => {
    const testtoken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const testquizid = requestQuizCreateV2(testtoken.token, 'valid name', 'valid description');
    requestCreateQuizQuestionV2(testtoken.token, testquizid.quizId, testQuestionBody);
    const testsessionid = requestSessionStart(testtoken.token, autoStartNumTest, testquizid.quizId);
    const testplayerid = requestPlayerJoin('asdf', testsessionid.sessionId);
    expect(requestPlayerStatus(testplayerid.playerId)).toStrictEqual({
      state: 'LOBBY',
      numQuestions: 1,
      atQuestion: 0
    });
  });
  test('Correct behaviour: auto start', () => {
    const testtoken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const testquizid = requestQuizCreateV2(testtoken.token, 'valid name', 'valid description');
    requestCreateQuizQuestionV2(testtoken.token, testquizid.quizId, testQuestionBody);
    const testsessionid = requestSessionStart(testtoken.token, autoStartNumTest, testquizid.quizId);
    requestPlayerJoin('', testsessionid.sessionId);
    requestPlayerJoin('', testsessionid.sessionId);
    requestPlayerJoin('', testsessionid.sessionId);
    expect(requestGetQuizSessionStatus(testtoken.token, testquizid.quizId, testsessionid.sessionId).state).toStrictEqual('QUESTION_COUNTDOWN');
  });
});
