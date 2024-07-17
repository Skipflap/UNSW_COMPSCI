import HTTPError from 'http-errors';
import { requestAuthRegister, requestClear, requestQuizCreateV2, requestSessionStart, requestCreateQuizQuestionV2, requestPlayerJoin, requestPlayerSendChat, requestSessionChat } from './wrappers';
import { QuestionsBody } from '../interface';

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

const testQuestionBody: QuestionsBody = {
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
const autoStartNumConst = 3;

describe('Error tests', () => {
  test('Error: Invalid Player ID', () => {
    const testToken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const testQuizId = requestQuizCreateV2(testToken.token, 'valid name1', 'valid description');
    requestCreateQuizQuestionV2(testToken.token, testQuizId.quizId, testQuestionBody);
    const testSessionId = requestSessionStart(testToken.token, autoStartNumConst, testQuizId.quizId);
    const testPlayerId = requestPlayerJoin('asdf', testSessionId.sessionId);
    requestPlayerSendChat(testPlayerId.playerId, 'asdfasdf');
    expect(() => requestSessionChat(testPlayerId.playerId + 1)).toThrow(HTTPError[400]);
  });
});

describe('Correct tests', () => {
  test('Correct return: two message one player', () => {
    const testToken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const testQuizId = requestQuizCreateV2(testToken.token, 'valid name1', 'valid description');
    requestCreateQuizQuestionV2(testToken.token, testQuizId.quizId, testQuestionBody);
    const testSessionId = requestSessionStart(testToken.token, autoStartNumConst, testQuizId.quizId);
    const testPlayerId = requestPlayerJoin('asdf', testSessionId.sessionId);
    requestPlayerSendChat(testPlayerId.playerId, 'asdfasdf');
    requestPlayerSendChat(testPlayerId.playerId, 'poiupoiu');
    expect(requestSessionChat(testPlayerId.playerId)).toStrictEqual({
      messages: [
        {
          messageBody: 'asdfasdf',
          playerId: testPlayerId.playerId,
          playerName: 'asdf',
          timeSent: expect.any(Number),
        },
        {
          messageBody: 'poiupoiu',
          playerId: testPlayerId.playerId,
          playerName: 'asdf',
          timeSent: expect.any(Number),
        }
      ]
    });
  });
  test('Correct return: two message two players', () => {
    const testToken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const testQuizId = requestQuizCreateV2(testToken.token, 'valid name1', 'valid description');
    requestCreateQuizQuestionV2(testToken.token, testQuizId.quizId, testQuestionBody);
    const testSessionId = requestSessionStart(testToken.token, autoStartNumConst, testQuizId.quizId);
    const testPlayerId1 = requestPlayerJoin('asdf', testSessionId.sessionId);
    const testPlayerId2 = requestPlayerJoin('fdas', testSessionId.sessionId);
    requestPlayerSendChat(testPlayerId1.playerId, 'asdfasdf');
    requestPlayerSendChat(testPlayerId2.playerId, 'poiupoiu');
    expect(requestSessionChat(testPlayerId1.playerId)).toStrictEqual({
      messages: [
        {
          messageBody: 'asdfasdf',
          playerId: testPlayerId1.playerId,
          playerName: 'asdf',
          timeSent: expect.any(Number),
        },
        {
          messageBody: 'poiupoiu',
          playerId: testPlayerId2.playerId,
          playerName: 'fdas',
          timeSent: expect.any(Number),
        }
      ]
    });
  });
});
