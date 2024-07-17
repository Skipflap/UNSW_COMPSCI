import { requestAuthRegister, requestPlayerQuestionInformation, requestPlayerJoin, requestSessionStateUpdate, requestCreateQuizQuestionV2, requestClear, requestQuizCreateV2, requestSessionStart } from './wrappers';
import HTTPError from 'http-errors';

let testToken: string, quizId: number, playerId: number, sessionId: number;
beforeEach(() => {
  requestClear();
  testToken = requestAuthRegister('validtest@gmail.com', 'valid123', 'validfirst', 'validlast').token;
  quizId = requestQuizCreateV2(testToken, 'Test Quiz', 'Description test for quiz.').quizId;
  requestCreateQuizQuestionV2(
    testToken,
    quizId,
    {
      question: 'Who is the Monarch of England?',
      duration: 1,
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
    }
  );
  requestCreateQuizQuestionV2(
    testToken,
    quizId,
    {
      question: 'Who is a master coder?',
      duration: 3,
      points: 5,
      answers: [
        {
          answer: 'Samuel Harland',
          correct: false
        },
        {
          answer: 'Hayden Smith',
          correct: true
        }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    }
  );
  requestCreateQuizQuestionV2(
    testToken,
    quizId,
    {
      question: 'Who is the best rapper?',
      duration: 3,
      points: 5,
      answers: [
        {
          answer: 'Drake',
          correct: false
        },
        {
          answer: 'Kendrick Lamar',
          correct: true
        }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    }
  );
  sessionId = requestSessionStart(testToken, 3, quizId).sessionId;
  playerId = requestPlayerJoin('SamuelH101', sessionId).playerId;
}, 1000);

describe('Error Tests', () => {
  test('Error: Player ID does not exist', () => {
    const invalidPlayerId = playerId + 1;
    expect(() => requestPlayerQuestionInformation(invalidPlayerId, 1)).toThrow(HTTPError[400]);
  });

  test('Error: Question position is not valid for the session this player is in', () => {
    const invalidQuestionPosition1 = -1;
    const invalidQuestionPosition2 = 4;
    expect(() => requestPlayerQuestionInformation(playerId, invalidQuestionPosition1)).toThrow(HTTPError[400]);
    expect(() => requestPlayerQuestionInformation(playerId, invalidQuestionPosition2)).toThrow(HTTPError[400]);
  });

  test('Error: Session is not currently on this question', () => {
    requestSessionStateUpdate(testToken, quizId, sessionId, 'NEXT_QUESTION');
    requestSessionStateUpdate(testToken, quizId, sessionId, 'SKIP_COUNTDOWN');
    expect(() => requestPlayerQuestionInformation(playerId, 3)).toThrow(HTTPError[400]);
  });

  test('Error: Session is in LOBBY, QUESTION_COUNTDOWN, or END state', () => {
    expect(() => requestPlayerQuestionInformation(playerId, 1)).toThrow(HTTPError[400]);
    requestSessionStateUpdate(testToken, quizId, sessionId, 'NEXT_QUESTION');
    expect(() => requestPlayerQuestionInformation(playerId, 1)).toThrow(HTTPError[400]);
    requestSessionStateUpdate(testToken, quizId, sessionId, 'END');
    expect(() => requestPlayerQuestionInformation(playerId, 1)).toThrow(HTTPError[400]);
  });
});

describe('Correct Tests', () => {
  test('Correct return type: works on 1st question and after changing to next question', () => {
    requestSessionStateUpdate(testToken, quizId, sessionId, 'NEXT_QUESTION');
    requestSessionStateUpdate(testToken, quizId, sessionId, 'SKIP_COUNTDOWN');
    expect(requestPlayerQuestionInformation(playerId, 1)).toStrictEqual({
      questionId: expect.any(Number),
      question: 'Who is the Monarch of England?',
      duration: 1,
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
      points: 5,
      answers: [
        {
          answerId: expect.any(Number),
          answer: 'Prince Charles',
          colour: expect.any(String)
        },
        {
          answerId: expect.any(Number),
          answer: 'Samuel Harland',
          colour: expect.any(String)
        }
      ]
    });
    requestSessionStateUpdate(testToken, quizId, sessionId, 'GO_TO_ANSWER');
    requestSessionStateUpdate(testToken, quizId, sessionId, 'NEXT_QUESTION');
    requestSessionStateUpdate(testToken, quizId, sessionId, 'SKIP_COUNTDOWN');
    expect(requestPlayerQuestionInformation(playerId, 2)).toStrictEqual({
      questionId: expect.any(Number),
      question: 'Who is a master coder?',
      duration: 3,
      points: 5,
      answers: [
        {
          answerId: expect.any(Number),
          answer: 'Samuel Harland',
          colour: expect.any(String)
        },
        {
          answerId: expect.any(Number),
          answer: 'Hayden Smith',
          colour: expect.any(String)
        }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    });
  });
});
