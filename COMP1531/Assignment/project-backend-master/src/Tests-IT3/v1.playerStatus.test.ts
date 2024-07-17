import HTTPError from 'http-errors';
import {
  requestAuthRegister,
  requestQuizCreateV2,
  requestSessionStart,
  requestClear,
  requestSessionStateUpdate,
  requestPlayerJoin,
  requestCreateQuizQuestionV2,
  requestPlayerStatus
} from './wrappers';

// Tests
let token1: string, quizId1: number, sessionId1: number;
let quizId2: number;
let player: number;
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
});

describe('Errors', () => {
  test('400 - invalid PlayerId', () => {
    expect(() => requestPlayerStatus(player + 1)).toThrow(HTTPError[400]);
  });
});

describe('Successful Runs', () => {
  test('the run was not thrown', () => {
    expect(() => requestPlayerStatus(player)).not.toThrow();
    expect(requestPlayerStatus(player)).toStrictEqual({
      state: 'LOBBY',
      numQuestions: 3,
      atQuestion: 0
    });
  });
  test('another state test', () => {
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    expect(() => requestPlayerStatus(player)).not.toThrow();
    expect(requestPlayerStatus(player)).toStrictEqual({
      state: 'QUESTION_COUNTDOWN',
      numQuestions: 3,
      atQuestion: 1
    });
  });
  test('another question test', () => {
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    expect(() => requestPlayerStatus(player)).not.toThrow();
    expect(requestPlayerStatus(player)).toStrictEqual({
      state: 'QUESTION_COUNTDOWN',
      numQuestions: 3,
      atQuestion: 2
    });
  });
});
