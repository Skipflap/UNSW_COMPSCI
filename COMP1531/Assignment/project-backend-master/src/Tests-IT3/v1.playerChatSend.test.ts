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
  const invalidMessageBody = 'x'.repeat(101);
  test.each([
    { error: 'Message body less than 1 character', messageBody: '' },
    { error: 'Message body more than 100 characters', messageBody: invalidMessageBody }
  ])("Error: '$error'", ({ messageBody }) => {
    const testToken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const testQuizId = requestQuizCreateV2(testToken.token, 'valid name1', 'valid description');
    requestCreateQuizQuestionV2(testToken.token, testQuizId.quizId, testQuestionBody);
    const testSessionId = requestSessionStart(testToken.token, autoStartNumConst, testQuizId.quizId);
    const testPlayerId = requestPlayerJoin('asdf', testSessionId.sessionId);
    expect(() => requestPlayerSendChat(testPlayerId.playerId, messageBody)).toThrow(HTTPError[400]);
  });
  test('Error: Invalid Player ID', () => {
    const testToken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const testQuizId = requestQuizCreateV2(testToken.token, 'valid name1', 'valid description');
    requestCreateQuizQuestionV2(testToken.token, testQuizId.quizId, testQuestionBody);
    const testSessionId = requestSessionStart(testToken.token, autoStartNumConst, testQuizId.quizId);
    const testPlayerId = requestPlayerJoin('asdf', testSessionId.sessionId);
    expect(() => requestPlayerSendChat(testPlayerId.playerId + 1, 'asdfasdf')).toThrow(HTTPError[400]);
  });
});

describe('Correct tests', () => {
  test('Correct return', () => {
    const testToken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const testQuizId = requestQuizCreateV2(testToken.token, 'valid name1', 'valid description');
    requestCreateQuizQuestionV2(testToken.token, testQuizId.quizId, testQuestionBody);
    const testSessionId = requestSessionStart(testToken.token, autoStartNumConst, testQuizId.quizId);
    const testPlayerId = requestPlayerJoin('asdf', testSessionId.sessionId);
    expect(requestPlayerSendChat(testPlayerId.playerId, 'asdfasdf')).toStrictEqual({});
  });
  test('Correct behaviour: one player one message', () => {
    const testToken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const testQuizId = requestQuizCreateV2(testToken.token, 'valid name1', 'valid description');
    requestCreateQuizQuestionV2(testToken.token, testQuizId.quizId, testQuestionBody);
    const testSessionId = requestSessionStart(testToken.token, autoStartNumConst, testQuizId.quizId);
    const testPlayerId = requestPlayerJoin('asdf', testSessionId.sessionId);
    requestPlayerSendChat(testPlayerId.playerId, 'asdfasdf');
    expect(requestSessionChat(testPlayerId.playerId)).toStrictEqual({
      messages: [
        {
          messageBody: 'asdfasdf',
          playerId: testPlayerId.playerId,
          playerName: 'asdf',
          timeSent: expect.any(Number),
        }
      ]
    });
  });
  test('Correct behaviour: one player one message', () => {
    const testToken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const testQuizId = requestQuizCreateV2(testToken.token, 'valid name1', 'valid description');
    requestCreateQuizQuestionV2(testToken.token, testQuizId.quizId, testQuestionBody);
    const testSessionId = requestSessionStart(testToken.token, autoStartNumConst, testQuizId.quizId);
    const testPlayerId = requestPlayerJoin('asdf', testSessionId.sessionId);
    requestPlayerSendChat(testPlayerId.playerId, 'asdfasdf');
    expect(requestSessionChat(testPlayerId.playerId)).toStrictEqual({
      messages: [
        {
          messageBody: 'asdfasdf',
          playerId: testPlayerId.playerId,
          playerName: 'asdf',
          timeSent: expect.any(Number),
        }
      ]
    });
  });
});
