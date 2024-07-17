import HTTPError from 'http-errors';
import { requestClear, requestAuthRegister, requestGetQuizInfoV2, requestQuizCreateV2 } from './wrappers';

let token1, token2, firstQuizUser1, secondQuizUser1, firstQuizUser2;

beforeEach(() => {
  requestClear();

  // user 1 has 2 quizzes.
  token1 = requestAuthRegister('lebron724@gmail.com', 'ball1234', 'Lebron', 'James').token;
  firstQuizUser1 = requestQuizCreateV2(token1, 'Bball', '10 questions on Basketball Teams').quizId;
  secondQuizUser1 = requestQuizCreateV2(token1, 'Highlights', 'Quiz on basketball highlights').quizId;

  // user 2 has 1 quiz.
  token2 = requestAuthRegister('messi448@gmail.com', 'soccer2312', 'Leo', 'Messi').token;
  firstQuizUser2 = requestQuizCreateV2(token2, 'Soccer', '5 questions of Soccer teams').quizId;
});

describe('Errors with quizInfo', () => {
  test('ERROR (401) - Token is empty or invalid', () => {
    const inValidToken = token1 + token2;
    const emptyToken = '';

    expect(() => requestGetQuizInfoV2(firstQuizUser1, inValidToken)).toThrow(HTTPError[401]);
    expect(() => requestGetQuizInfoV2(firstQuizUser1, emptyToken)).toThrow(HTTPError[401]);
  });

  test('quizInfo is UnSuccessful (403) - Valid token but user does not own the quiz', () => {
    expect(() => requestGetQuizInfoV2(firstQuizUser1, token2)).toThrow(HTTPError[403]);
    expect(() => requestGetQuizInfoV2(secondQuizUser1, token2)).toThrow(HTTPError[403]);
    expect(() => requestGetQuizInfoV2(firstQuizUser2, token1)).toThrow(HTTPError[403]);
  });

  test('quizInfo is UnSuccessful (403) - Valid token but user but quiz doesnt exist', () => {
    requestClear();
    const sessionToken = requestAuthRegister('lebron724@gmail.com', 'ball1234', 'Lebron', 'James').token;
    const quizId = requestQuizCreateV2(sessionToken, 'Bball', '10 questions on Basketball Teams').quizId;
    expect(() => requestGetQuizInfoV2(quizId + 1, sessionToken)).toThrow(HTTPError[403]);
  });
});

describe('Correct Tests', () => {
  test('quizInfo with User with one quiz', () => {
    const response5 = requestGetQuizInfoV2(firstQuizUser2, token2);

    expect(response5).toStrictEqual({
      quizId: firstQuizUser2,
      name: 'Soccer',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      numQuestions: 0,
      description: '5 questions of Soccer teams',
      questions: [],
      duration: 0,
      thumbnailUrl: expect.any(String)
    });
  });

  test('quizInfo with User owning two quizzes quiz', () => {
    const response6 = requestGetQuizInfoV2(firstQuizUser1, token1);

    expect(response6).toStrictEqual(
      {
        quizId: firstQuizUser1,
        name: 'Bball',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        numQuestions: 0,
        description: '10 questions on Basketball Teams',
        questions: [],
        duration: 0,
        thumbnailUrl: expect.any(String)
      }

    );
  });
});
