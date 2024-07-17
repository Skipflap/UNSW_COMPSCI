import HTTPError from 'http-errors';
import {
  requestClear,
  requestAuthRegister,
  requestTrashQuizV2,
  requestViewTrashV2,
  requestSessionStart,
  requestQuizCreateV2,
  requestQuizList,
  requestCreateQuizQuestionV2
} from './wrappers';

// Tests
let token1 : string, quizId1 : number, secondquizId1 : number;
let token2 : string, quizId2 : number;

beforeEach(() => {
  requestClear();

  token1 = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith').token;
  quizId1 = requestQuizCreateV2(token1, 'My Quiz Name', 'A description of my quiz').quizId;
  secondquizId1 = requestQuizCreateV2(token1, 'Snd Quiz Name', 'Another quiz').quizId;

  token2 = requestAuthRegister('berb.gray@unsw.edu.au', 'berbgray183', 'Berb', 'Gray').token;
  quizId2 = requestQuizCreateV2(token2, 'That Quiz Name', 'Yes another description').quizId;
});

// check time last edited
describe('Delete Quiz is Successful (200)', () => {
  test('Deleting Quiz1 from token1', () => {
    expect(requestTrashQuizV2(quizId1, token1)).toStrictEqual({});

    expect(requestQuizList(token1).quizzes[0]).toStrictEqual({ quizId: secondquizId1, name: 'Snd Quiz Name' });
    expect(requestViewTrashV2(token1).quizzes[0]).toStrictEqual({ quizId: quizId1, name: 'My Quiz Name' });
  });

  test('Deleting multiple quizzes', () => {
    expect(requestTrashQuizV2(quizId1, token1)).toStrictEqual({});

    expect(requestTrashQuizV2(quizId2, token2)).toStrictEqual({});

    expect(requestQuizList(token1).quizzes[0]).toStrictEqual({ quizId: secondquizId1, name: 'Snd Quiz Name' });
    expect(requestViewTrashV2(token1).quizzes[0]).toStrictEqual({ quizId: quizId1, name: 'My Quiz Name' });

    expect(requestQuizList(token2)).toStrictEqual({ quizzes: [] });
    expect(requestViewTrashV2(token2).quizzes[0]).toStrictEqual({ quizId: quizId2, name: 'That Quiz Name' });
  });
});

test('Delete Quiz is UnSuccessful (401) - Token is empty or invalid', () => {
  const emptyToken = '';
  const invalidToken = token1 + 'InvalidToken';

  expect(() => requestTrashQuizV2(quizId1, emptyToken)).toThrow(HTTPError[401]);
  expect(() => requestTrashQuizV2(quizId1, invalidToken)).toThrow(HTTPError[401]);
});

test('Delete Quiz is UnSuccessful (403) - Valid token but quiz ID invalid', () => {
  const invalidQuizId = quizId1 + 1;

  expect(() => requestTrashQuizV2(invalidQuizId, token1)).toThrow(HTTPError[403]);
});

test('Delete Quiz is UnSuccessful (403) - Valid token but user does not own the quiz', () => {
  expect(() => requestTrashQuizV2(quizId2, token1)).toThrow(HTTPError[403]);
});

test('Quiz is being used in active session (400)', () => {
  const validQuestion = {
    question: 'Favorite icecream flavor?',
    duration: 20,
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
  requestCreateQuizQuestionV2(token1, quizId1, validQuestion);
  requestSessionStart(token1, 0, quizId1);
  expect(() => requestTrashQuizV2(quizId1, token1)).toThrow(HTTPError[400]);
});
