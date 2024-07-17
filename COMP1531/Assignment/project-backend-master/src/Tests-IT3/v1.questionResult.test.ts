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

// Tests
let token1: string, quizId1: number, sessionId1: number;
let quizId2: number;
let player: number, answerId: number;
let player1: number;
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
  player1 = requestPlayerJoin('qwer', sessionId1).playerId;
  requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
  requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');
  answerId = requestGetQuizSessionStatus(token1, quizId1, sessionId1).metadata.questions[0].answers[0].answerId;

  const answerId1 = requestGetQuizSessionStatus(token1, quizId1, sessionId1).metadata.questions[0].answers[1].answerId;
  requestPlayerAnswer(player1, 1, [answerId1]);
  requestPlayerAnswer(player, 1, [answerId]);

  requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER');
});

describe('Errors', () => {
  test('400 - invalid PlayerId', () => {
    expect(() => requestQuestionResult(player + 1, 1)).toThrow(HTTPError[400]);
  });
  test('400 - invalid question Position', () => {
    expect(() => requestQuestionResult(player, 5)).toThrow(HTTPError[400]);
  });
  test('400 - session is not in answer show state', () => {
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'END');
    expect(() => requestQuestionResult(player, 1)).toThrow(HTTPError[400]);
  });
  test('400 - session not up to question yet', () => {
    expect(() => requestQuestionResult(player, 3)).toThrow(HTTPError[400]);
  });
});

describe('Successful Runs', () => {
  test('basic success', () => {
    expect(() => requestQuestionResult(player, 1)).not.toThrow();
    expect(requestQuestionResult(player, 1)).toStrictEqual({
      questionId: expect.any(Number),
      playersCorrectList: [
        'Chocolate'
      ],
      averageAnswerTime: expect.any(Number),
      percentCorrect: 50
    });
  });

  test('multiple people success', () => {
    expect(requestQuestionResult(player1, 1)).toStrictEqual({
      questionId: expect.any(Number),
      playersCorrectList: [
        'Vanilla'
      ],
      averageAnswerTime: expect.any(Number),
      percentCorrect: 50
    });
  });
});
