import HTTPError from 'http-errors';
import { requestClear, requestAuthRegister, requestGetQuizInfoV2, requestQuizCreateV2, requestUpdateQuizNameV2 } from './wrappers';

let token1, token2, firstQuizUser1, firstQuizUser2;

beforeEach(() => {
  requestClear();

  // user 1 has 2 quizzes.
  token1 = requestAuthRegister('lebron724@gmail.com', 'ball1234', 'Lebron', 'James').token;
  firstQuizUser1 = requestQuizCreateV2(token1, 'Bball', '10 questions on Basketball Teams').quizId;

  // user 2 has 1 quiz.
  token2 = requestAuthRegister('messi448@gmail.com', 'soccer2312', 'Leo', 'Messi').token;
  firstQuizUser2 = requestQuizCreateV2(token2, 'Soccer', '5 questions of Soccer teams').quizId;
});

describe('ERROR 400', () => {
  test('ERROR (400) - Name contains invalid characters', () => {
    const inValidName = 'BBALLL!!!!';

    expect(() => requestUpdateQuizNameV2(firstQuizUser1, token1, inValidName)).toThrow(HTTPError[400]);
  });

  test('ERROR (400) - Name to short to long < 3 or > 30', () => {
    const inValidName1 = 'hi';
    const inValidName2 = 'Lebrons James best highlights of his career';

    expect(() => requestUpdateQuizNameV2(firstQuizUser1, token1, inValidName1)).toThrow(HTTPError[400]);
    expect(() => requestUpdateQuizNameV2(firstQuizUser1, token1, inValidName2)).toThrow(HTTPError[400]);
  });

  test('ERROR (400) - Name is already in used in another quiz that is owned by you', () => {
    const repeatedName = 'Bball';
    expect(() => requestUpdateQuizNameV2(firstQuizUser1, token1, repeatedName)).toThrow(HTTPError[400]);
  });
});

describe('ERROR 401', () => {
  test('ERROR (401) - Empty or Invalid Token', () => {
    const inValidToken = '-1';
    const emptyToken = '';

    const validName = 'Do you know Bball';

    expect(() => requestUpdateQuizNameV2(firstQuizUser1, inValidToken, validName)).toThrow(HTTPError[401]);
    expect(() => requestUpdateQuizNameV2(firstQuizUser1, emptyToken, validName)).toThrow(HTTPError[401]);
  });
});

describe('ERROR 403 - Valid token but invalid quizid/does not own quiz', () => {
  test('ERROR (403) - Valid token but invalid quizid', () => {
    const validName1 = 'Do you know Bball';
    const inValidQuizId = -1;
    expect(() => requestUpdateQuizNameV2(inValidQuizId, token1, validName1)).toThrow(HTTPError[403]);
  });

  test('ERROR (403) - Valid token but user does not own quiz', () => {
    const validName2 = 'Do you know Bball';
    expect(() => requestUpdateQuizNameV2(firstQuizUser2, token1, validName2)).toThrow(HTTPError[403]);
  });
});

describe('Correct testing for updateQuizName', () => {
  test('User owning two quizzes correct update', () => {
    const validName3 = 'Do you know Bball';

    requestUpdateQuizNameV2(firstQuizUser1, token1, validName3);

    expect(requestGetQuizInfoV2(firstQuizUser1, token1)).toStrictEqual({
      quizId: firstQuizUser1,
      name: validName3,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      numQuestions: 0,
      description: '10 questions on Basketball Teams',
      questions: [],
      duration: 0,
      thumbnailUrl: expect.any(String)
    });
  });
});
