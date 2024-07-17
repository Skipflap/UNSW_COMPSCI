import HTTPError from 'http-errors';
import {
  requestAuthRegister,
  requestQuizCreateV2,
  requestSessionStart,
  requestClear,
  requestSessionStateUpdate,
  requestGetQuizSessionStatus,
  requestPlayerAnswer,
  requestPlayerJoin,
  requestCreateQuizQuestionV2,
  requestQuestionResult
} from './wrappers';

// Sleep function
function sleepSync(ms: number) {
  const startTime = new Date().getTime();
  while (new Date().getTime() - startTime < ms) {
    // zzzZZ - comment needed so eslint doesn't complain
  }
}

// Tests
let token1: string, quizId1: number, sessionId1: number;
let quizId2: number;
let player: number, player1: number, player2: number;
let answerId: number, answerId2: number, answerId3: number, answerId5: number;
// let questionId1: number, questionId2: number, questionId3: number, secondquestionId1: number;
const validQuestion1 = {
  question: 'Favorite icecream flavor?',
  duration: 5,
  points: 8,
  answers: [
    {
      answer: 'Chocolate',
      correct: true
    },
    {
      answer: 'Vanilla',
      correct: false
    }
  ],
  thumbnailUrl: 'http://google.com/some/image/path.jpg',
};
const validQuestion2 = {
  question: 'Favorite sport?',
  duration: 10,
  points: 2,
  answers: [
    {
      answer: 'Tennis',
      correct: true
    },
    {
      answer: 'BasketBall',
      correct: false
    },
    {
      answer: 'Baseball',
      correct: false
    },
    {
      answer: 'Netball',
      correct: true
    }
  ],
  thumbnailUrl: 'http://google.com/some/image/path.jpg',
};
const validQuestion3 = {
  question: 'Favorite hobby?',
  duration: 20,
  points: 8,
  answers: [
    {
      answer: 'Gameing',
      correct: true
    },
    {
      answer: 'Reading',
      correct: false
    },
    {
      answer: 'Sports',
      correct: false
    },
    {
      answer: 'Eating',
      correct: false
    }
  ],
  thumbnailUrl: 'http://google.com/some/image/path.jpg',
};

beforeEach(() => {
  requestClear();

  token1 = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith').token;
  quizId1 = requestQuizCreateV2(token1, 'My Quiz Name', 'A description of my quiz').quizId;
  requestCreateQuizQuestionV2(token1, quizId1, validQuestion1); // questionId1
  requestCreateQuizQuestionV2(token1, quizId1, validQuestion2); // questionId2
  requestCreateQuizQuestionV2(token1, quizId1, validQuestion3); // questionId3
  sessionId1 = requestSessionStart(token1, 0, quizId1).sessionId;

  quizId2 = requestQuizCreateV2(token1, 'ONe Quiz Name', 'A description of my quiz').quizId;
  requestCreateQuizQuestionV2(token1, quizId2, validQuestion1); // secondquestionId1
  player = requestPlayerJoin('asdf', sessionId1).playerId;
  player1 = requestPlayerJoin('dsns', sessionId1).playerId;
  player2 = requestPlayerJoin('OLJN', sessionId1).playerId;
  requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
  requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');
  answerId = requestGetQuizSessionStatus(token1, quizId1, sessionId1).metadata.questions[0].answers[0].answerId;
  answerId2 = requestGetQuizSessionStatus(token1, quizId1, sessionId1).metadata.questions[1].answers[0].answerId;
  answerId3 = requestGetQuizSessionStatus(token1, quizId1, sessionId1).metadata.questions[1].answers[1].answerId;
  answerId5 = requestGetQuizSessionStatus(token1, quizId1, sessionId1).metadata.questions[1].answers[3].answerId;
});

describe('Errors', () => {
  test('400 - invalid PlayerId', () => {
    expect(() => requestPlayerAnswer(player + 1, 1, [answerId])).toThrow(HTTPError[400]);
  });
  test('400 - invalid question Position', () => {
    expect(() => requestPlayerAnswer(player, 5, [answerId])).toThrow(HTTPError[400]);
  });
  test('400 - invalid session state', () => {
    sleepSync(5 * 1100);
    expect(() => requestPlayerAnswer(player, 1, [answerId])).toThrow(HTTPError[400]);
  });
  test('400 - session not up to question yet', () => {
    expect(() => requestPlayerAnswer(player, 3, [answerId])).toThrow(HTTPError[400]);
  });
  test('400 - invalid answerId for question', () => {
    expect(() => requestPlayerAnswer(player, 1, [answerId + 1])).toThrow(HTTPError[400]);
  });
  test('400 - duplicate answerId provided', () => {
    expect(() => requestPlayerAnswer(player, 1, [answerId, answerId])).toThrow(HTTPError[400]);
  });
  test('400 - less than 1 answerId provided', () => {
    expect(() => requestPlayerAnswer(player, 1, [])).toThrow(HTTPError[400]);
  });
});

describe('Successful Runs', () => {
  test('basic success', () => {
    expect(() => requestPlayerAnswer(player, 1, [answerId])).not.toThrow();
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER');
    expect(requestQuestionResult(player, 1)).toStrictEqual({
      questionId: expect.any(Number),
      playersCorrectList: [
        'Chocolate'
      ],
      averageAnswerTime: expect.any(Number),
      percentCorrect: 33
    });
  });
  test('multiple people success', () => {
    expect(() => requestPlayerAnswer(player, 1, [answerId])).not.toThrow();
    expect(() => requestPlayerAnswer(player1, 1, [answerId])).not.toThrow();
    expect(() => requestPlayerAnswer(player2, 1, [answerId])).not.toThrow();
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER');
    expect(requestQuestionResult(player, 1)).toStrictEqual({
      questionId: expect.any(Number),
      playersCorrectList: [
        'Chocolate'
      ],
      averageAnswerTime: expect.any(Number),
      percentCorrect: 100
    });
    expect(requestQuestionResult(player1, 1)).toStrictEqual({
      questionId: expect.any(Number),
      playersCorrectList: [
        'Chocolate'
      ],
      averageAnswerTime: expect.any(Number),
      percentCorrect: 100
    });
    expect(requestQuestionResult(player2, 1)).toStrictEqual({
      questionId: expect.any(Number),
      playersCorrectList: [
        'Chocolate'
      ],
      averageAnswerTime: expect.any(Number),
      percentCorrect: 100
    });
  });

  test('multiple answer success', () => {
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');
    expect(() => requestPlayerAnswer(player, 2, [answerId2, answerId5])).not.toThrow();
    expect(() => requestPlayerAnswer(player1, 2, [answerId3, answerId2])).not.toThrow();
    expect(() => requestPlayerAnswer(player2, 2, [answerId5, answerId2])).not.toThrow();
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER');
    expect(requestQuestionResult(player, 2)).toStrictEqual({
      questionId: expect.any(Number),
      playersCorrectList: [
        expect.any(String),
        expect.any(String)
      ],
      averageAnswerTime: expect.any(Number),
      percentCorrect: 66
    });
    expect(requestQuestionResult(player1, 2)).toStrictEqual({
      questionId: expect.any(Number),
      playersCorrectList: [
        expect.any(String),
        expect.any(String)
      ],
      averageAnswerTime: expect.any(Number),
      percentCorrect: 66
    });
    expect(requestQuestionResult(player2, 2)).toStrictEqual({
      questionId: expect.any(Number),
      playersCorrectList: [
        expect.any(String),
        expect.any(String)
      ],
      averageAnswerTime: expect.any(Number),
      percentCorrect: 66
    });
  });
});
