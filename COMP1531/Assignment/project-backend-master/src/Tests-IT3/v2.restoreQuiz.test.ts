import HTTPError from 'http-errors';
import {
  requestClear,
  requestAuthRegister,
  requestTrashQuizV2,
  requestViewTrashV2,
  requestRestoreQuizV2,
  requestQuizCreateV2,
  requestQuizList,
  requestGetQuizInfoV2,
} from './wrappers';

// Tests
let token1 : string, quizId1 : number, secondquizId1 : number;
let token2 : string;

beforeEach(() => {
  requestClear();

  token1 = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith').token;
  quizId1 = requestQuizCreateV2(token1, 'My Quiz Name', 'A description of my quiz').quizId;
  secondquizId1 = requestQuizCreateV2(token1, 'Snd Quiz Name', 'Another quiz').quizId;

  token2 = requestAuthRegister('berb.gray@unsw.edu.au', 'berbgray183', 'Berb', 'Gray').token;
});

describe('Errors', () => {
  test('Error 400 - name of restored quiz is taken by another active quiz', () => {
    requestTrashQuizV2(quizId1, token1);
    requestQuizCreateV2(token1, 'My Quiz Name', 'A description of my quiz');

    expect(() => requestRestoreQuizV2(token1, quizId1)).toThrow(HTTPError[400]);
  });
  test('Error 400 - quizid refers to a quiz not in trash', () => {
    expect(() => requestRestoreQuizV2(token1, quizId1)).toThrow(HTTPError[400]);
  });

  test('Error 401 - token is empty', () => {
    requestTrashQuizV2(quizId1, token1);
    const emptyToken = '';

    expect(() => requestRestoreQuizV2(emptyToken, quizId1)).toThrow(HTTPError[401]);
  });
  test('Error 401 - token is invalid', () => {
    requestTrashQuizV2(quizId1, token1);
    const invalidToken = token1 + 'Invalid Token';

    expect(() => requestRestoreQuizV2(invalidToken, quizId1)).toThrow(HTTPError[401]);
  });

  test('Error 403 - token is valid but quizid is invalid', () => {
    requestTrashQuizV2(quizId1, token1);
    const invalidQuizId = quizId1 + 1;

    expect(() => requestRestoreQuizV2(token1, invalidQuizId)).toThrow(HTTPError[403]);
  });
  test('Error 403 - token is valid but user does not own the quiz', () => {
    requestTrashQuizV2(quizId1, token1);

    expect(() => requestRestoreQuizV2(token2, quizId1)).toThrow(HTTPError[403]);
  });
});

describe('Successful Run 200', () => {
  test('Single test in trash', () => {
    requestTrashQuizV2(quizId1, token1);
    requestTrashQuizV2(secondquizId1, token1);

    expect(requestRestoreQuizV2(token1, quizId1)).toStrictEqual({});
    const quizDetails = requestGetQuizInfoV2(quizId1, token1);
    expect(quizDetails.timeLastEdited).toBeGreaterThanOrEqual(quizDetails.timeCreated);

    expect(requestQuizList(token1)).toStrictEqual({
      quizzes: [
        {
          quizId: quizId1,
          name: 'My Quiz Name'
        }
      ]
    });
    expect(requestViewTrashV2(token1)).toStrictEqual({
      quizzes: [
        {
          quizId: secondquizId1,
          name: 'Snd Quiz Name'
        }
      ]
    });
  });
});
