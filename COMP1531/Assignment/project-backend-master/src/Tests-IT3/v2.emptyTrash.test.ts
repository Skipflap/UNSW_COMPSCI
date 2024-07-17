import HTTPError from 'http-errors';
import {
  requestClear,
  requestAuthRegister,
  requestTrashQuizV2,
  requestViewTrashV2,
  requestEmptyTrashV2,
  requestQuizCreateV2
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

describe('Errors', () => {
  test('Error 400 - at least one of the quizzes is not in trash', () => {
    requestTrashQuizV2(quizId1, token1);
    const quizIds = [quizId1, secondquizId1];

    expect(() => requestEmptyTrashV2(token1, quizIds)).toThrow(HTTPError[400]);
  });

  test('Error 401 - token is empty', () => {
    requestTrashQuizV2(quizId1, token1);
    requestTrashQuizV2(secondquizId1, token1);
    const quizIds = [quizId1, secondquizId1];
    const emptyToken = '';
    expect(() => requestEmptyTrashV2(emptyToken, quizIds)).toThrow(HTTPError[401]);
  });
  test('Error 401 - token is invalid', () => {
    requestTrashQuizV2(quizId1, token1);
    requestTrashQuizV2(secondquizId1, token1);
    const quizIds = [quizId1, secondquizId1];
    const invalidToken = token1 + 'InvalidToken';
    expect(() => requestEmptyTrashV2(invalidToken, quizIds)).toThrow(HTTPError[401]);
  });

  test('Error 403 - token is valid but user does not own one or more of the quizes', () => {
    requestTrashQuizV2(quizId1, token1);
    requestTrashQuizV2(quizId2, token2);
    const quizIds = [quizId1, quizId2];
    expect(() => requestEmptyTrashV2(token1, quizIds)).toThrow(HTTPError[403]);
  });
});

describe('Successful Run 200', () => {
  test('Empty trash of two quizzes', () => {
    requestTrashQuizV2(quizId1, token1);
    requestTrashQuizV2(secondquizId1, token1);
    const quizIds = [quizId1, secondquizId1];
    expect(requestEmptyTrashV2(token1, quizIds)).toStrictEqual({});

    expect(requestViewTrashV2(token1)).toStrictEqual({
      quizzes: []
    });
  });
});
