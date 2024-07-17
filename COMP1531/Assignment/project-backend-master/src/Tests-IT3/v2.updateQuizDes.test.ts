import HTTPError from 'http-errors';
import { requestClear, requestAuthRegister, requestGetQuizInfoV2, requestQuizCreateV2, adminQuizDescriptionUpdateV2 } from './wrappers';

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

describe('ERRORS', () => {
  test('ERROR (400) - Description is more than 100 characters in length', () => {
    const inValidDes = '10 questions on Basketball Teams 10 questions on Basketball Teams 10 questions on Basketball Teams 1010';

    expect(() => adminQuizDescriptionUpdateV2(firstQuizUser1, token1, inValidDes)).toThrow(HTTPError[400]);
  });

  test('ERROR (401) - Token is empty or invalid', () => {
    const validDes = '25 questions on Basketball Teams';
    const inValidToken = '-1';
    const emptyToken = '';

    expect(() => adminQuizDescriptionUpdateV2(firstQuizUser1, inValidToken, validDes)).toThrow(HTTPError[401]);
    expect(() => adminQuizDescriptionUpdateV2(firstQuizUser1, emptyToken, validDes)).toThrow(HTTPError[401]);
  });

  test('ERROR (403) - Valid token but either userId or quizId is invalid', () => {
    const validDes1 = '25 questions on Basketball Teams';
    const inValidQuizId = -1;

    expect(() => adminQuizDescriptionUpdateV2(inValidQuizId, token1, validDes1)).toThrow(HTTPError[403]);
  });
});

describe('Correct testing for updateQuizDescription', () => {
  test('User owning two quizzes correct update', () => {
    const validDes2 = '25 questions on Basketball Teams';
    const validDes3 = 'The best ball highlights';

    adminQuizDescriptionUpdateV2(firstQuizUser1, token1, validDes2);
    adminQuizDescriptionUpdateV2(secondQuizUser1, token1, validDes3);

    expect(requestGetQuizInfoV2(firstQuizUser1, token1)).toStrictEqual({
      quizId: firstQuizUser1,
      name: 'Bball',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      numQuestions: 0,
      description: validDes2,
      questions: [],
      duration: 0,
      thumbnailUrl: expect.any(String)
    });

    expect(requestGetQuizInfoV2(secondQuizUser1, token1)).toStrictEqual({
      quizId: secondQuizUser1,
      name: 'Highlights',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      numQuestions: 0,
      description: validDes3,
      questions: [],
      duration: 0,
      thumbnailUrl: expect.any(String)
    });
  });

  test('User owning one quiz correct update', () => {
    const validDes4 = '5 questions of Soccer teams';
    adminQuizDescriptionUpdateV2(firstQuizUser2, token2, validDes4);

    expect(requestGetQuizInfoV2(firstQuizUser2, token2)).toStrictEqual({
      quizId: firstQuizUser2,
      name: 'Soccer',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      numQuestions: 0,
      description: validDes4,
      questions: [],
      duration: 0,
      thumbnailUrl: expect.any(String)
    });
  });
});
