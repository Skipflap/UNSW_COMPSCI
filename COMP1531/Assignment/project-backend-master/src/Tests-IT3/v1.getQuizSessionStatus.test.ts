import HTTPError from 'http-errors';
import {
  requestAuthRegister,
  requestQuizCreateV2,
  requestSessionStart,
  requestClear,
  requestGetQuizSessionStatus,
  requestCreateQuizQuestionV2
} from './wrappers';

// Tests
let token1 : string, quizId1 : number, sessionId1: number, questionId1: number;
let quizId2: number, secondSessionId1: number;
let token2: string;
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

beforeEach(() => {
  requestClear();

  token1 = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith').token;
  quizId1 = requestQuizCreateV2(token1, 'My Quiz Name', 'A description of my quiz').quizId;
  questionId1 = requestCreateQuizQuestionV2(token1, quizId1, validQuestion1).questionId;
  sessionId1 = requestSessionStart(token1, 0, quizId1).sessionId;

  quizId2 = requestQuizCreateV2(token1, 'ONe Quiz Name', 'A description of my quiz').quizId;
  requestCreateQuizQuestionV2(token1, quizId2, validQuestion1);
  secondSessionId1 = requestSessionStart(token1, 0, quizId2).sessionId;
  token2 = requestAuthRegister('berb.gray@unsw.edu.au', 'berbgray183', 'Berb', 'Gray').token;
});

describe('Errors', () => {
  test('token is empty (401)', () => {
    const emptyToken = '';
    expect(() => requestGetQuizSessionStatus(emptyToken, quizId1, sessionId1)).toThrow(HTTPError[401]);
  });
  test('token is invalid (401)', () => {
    const invalidToken = token1 + 'Invalid Token';
    expect(() => requestGetQuizSessionStatus(invalidToken, quizId1, sessionId1)).toThrow(HTTPError[401]);
  });

  test('Valid token is provided, but user is not an owner of this quiz (403)', () => {
    expect(() => requestGetQuizSessionStatus(token2, quizId1, sessionId1)).toThrow(HTTPError[403]);
  });
  test('Valid token is provided, but quiz does not exist (403)', () => {
    requestClear();
    token1 = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith').token;
    quizId1 = requestQuizCreateV2(token1, 'My Quiz Name', 'A description of my quiz').quizId;
    questionId1 = requestCreateQuizQuestionV2(token1, quizId1, validQuestion1).questionId;
    sessionId1 = requestSessionStart(token1, 0, quizId1).sessionId;
    expect(() => requestGetQuizSessionStatus(token1, quizId1 + 1, sessionId1)).toThrow(HTTPError[403]);
  });

  test('Session Id does not refer to a valid session within this quiz (400)', () => {
    expect(() => requestGetQuizSessionStatus(token1, quizId1, secondSessionId1)).toThrow(HTTPError[400]);
  });
});

test('Successful Run', () => {
  expect(requestGetQuizSessionStatus(token1, quizId1, sessionId1)).toStrictEqual({
    state: 'LOBBY',
    atQuestion: 0,
    players: [],
    metadata: {
      quizId: quizId1,
      name: 'My Quiz Name',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'A description of my quiz',
      numQuestions: 1,
      questions: [
        {
          questionId: questionId1,
          question: 'Favorite icecream flavor?',
          duration: 5,
          thumbnailUrl: 'http://google.com/some/image/path.jpg',
          points: 8,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'Chocolate',
              colour: expect.any(String),
              correct: true
            },
            {
              answerId: expect.any(Number),
              answer: 'Vanilla',
              colour: expect.any(String),
              correct: false
            }
          ]
        }
      ],
      duration: 5,
      thumbnailUrl: ''
    }
  });
});
