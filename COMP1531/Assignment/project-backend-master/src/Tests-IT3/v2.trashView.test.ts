import HTTPError from 'http-errors';
import {
  requestClear,
  requestAuthRegister,
  requestTrashQuizV2,
  requestViewTrashV2,
  requestQuizCreateV2
} from './wrappers';

// Tests
let token1 : string, quizId1 : number;
beforeEach(() => {
  requestClear();

  token1 = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith').token;
  quizId1 = requestQuizCreateV2(token1, 'My Quiz Name', 'A description of my quiz').quizId;
});

test('View trash is UnSuccessful (401) - Token is empty or invalid', () => {
  const emptyToken = '';
  const invalidToken = token1 + 'InvalidToken';

  requestTrashQuizV2(quizId1, token1);
  expect(() => requestViewTrashV2(emptyToken)).toThrow(HTTPError[401]);
  expect(() => requestViewTrashV2(invalidToken)).toThrow(HTTPError[401]);
});

test('View trash is Successful (200)', () => {
  requestTrashQuizV2(quizId1, token1);
  expect(requestViewTrashV2(token1)).toStrictEqual({
    quizzes: [
      {
        quizId: quizId1,
        name: 'My Quiz Name'
      },
    ]
  });
});
