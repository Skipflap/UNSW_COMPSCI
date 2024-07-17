import { HttpError } from 'http-errors';
import { requestAuthRegister, requestQuizCreateV2, requestQuizTransfer, requestGetQuizInfoV2, requestClear, requestSessionStart, requestCreateQuizQuestionV2 } from './wrappers';
import HTTPError from 'http-errors';

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

const quizCreate = (testtoken: string) => {
  return requestQuizCreateV2(testtoken, 'valid name', 'valid description');
};

const quizCreate1 = (testtoken: string) => {
  return requestQuizCreateV2(testtoken, 'ASDFASDF', 'valid description');
};

const questionCreate = (testtoken: string, quizId: number) => {
  return requestCreateQuizQuestionV2(
    testtoken,
    quizId,
    {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Samuel Harland',
          correct: false
        }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    });
};

describe('Error tests', () => {
  test.each([
    {
      error: 'Token empty', token: ''
    },
    {
      error: 'Token invalid', token: '-1'
    }
  ])("Error: '$error'", ({ token }) => {
    const sessiontoken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const sessiontoken1 = requestAuthRegister('asdf.asdf@unsw.edu.au', 'VeryStr0ngPassword', 'ASDF', 'ASDF');
    const quizId = quizCreate(sessiontoken.token);
    quizCreate1(sessiontoken1.token);
    expect(() => requestQuizTransfer(token, 'asdf.asdf@unsw.edu.au', quizId.quizId)).toThrow(HTTPError[401]);
  });
  test.each([
    {
      error: 'userEmail not real user', email: 'dfkdsfksdfkd@gmail.com'
    },
    {
      error: 'userEmail currently logged in', email: 'hayden.smith@unsw.edu.au'
    }
  ])("Error: '$error'", ({ email }) => {
    const sessiontoken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const sessiontoken1 = requestAuthRegister('asdf.asdf@unsw.edu.au', 'VeryStr0ngPassword', 'ASDF', 'ASDF');
    const quizId = quizCreate(sessiontoken.token);
    quizCreate1(sessiontoken1.token);
    expect(() => requestQuizTransfer(sessiontoken.token, email, quizId.quizId)).toThrow(HTTPError[400]);
  });
  test('Error: name of imported quiz already exists', () => {
    const sessiontoken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const quizResponse = requestQuizCreateV2(sessiontoken.token, 'ASDFASDF', 'valid description');
    const sessiontoken1 = requestAuthRegister('asdf.asdf@unsw.edu.au', 'VeryStr0ngPassword', 'ASDF', 'ASDF');
    const quizId = quizResponse.quizId;
    quizCreate1(sessiontoken1.token);
    expect(() => requestQuizTransfer(sessiontoken.token, 'asdf.asdf@unsw.edu.au', quizId)).toThrow(HTTPError[400]);
  });
  test('Error: quiz ID invalid', () => {
    const sessiontoken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const sessiontoken1 = requestAuthRegister('asdf.asdf@unsw.edu.au', 'VeryStr0ngPassword', 'ASDF', 'ASDF');
    quizCreate(sessiontoken.token);
    quizCreate1(sessiontoken1.token);
    expect(() => requestQuizTransfer(sessiontoken.token, 'asdf.asdf@unsw.edu.au', -1)).toThrow(HTTPError[403]);
  });
  test('Error: Any session for this quiz is not in END state', () => {
    const sessiontoken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    requestAuthRegister('asdf.asdf@unsw.edu.au', 'haydens345645', 'Hayden', 'Smith');
    const quizId = quizCreate(sessiontoken.token);
    questionCreate(sessiontoken.token, quizId.quizId);
    requestSessionStart(sessiontoken.token, 3, quizId.quizId);
    expect(() => requestQuizTransfer(sessiontoken.token, 'asdf.asdf@unsw.edu.au', quizId.quizId)).toThrow(HTTPError[400]);
  });
});

describe('Correct tests', () => {
  test('Correct return', () => {
    const sessiontoken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const quizId = quizCreate(sessiontoken.token);
    const sessiontoken1 = requestAuthRegister('asdf.asdf@unsw.edu.au', 'VeryStr0ngPassword', 'ASDF', 'ASDF');
    quizCreate1(sessiontoken1.token);
    expect(requestQuizTransfer(sessiontoken.token, 'asdf.asdf@unsw.edu.au', quizId.quizId.toString())).toStrictEqual({});
  });
  test('Correct behaviour', () => {
    const sessiontoken = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const quizId = quizCreate(sessiontoken.token);
    const sessiontoken1 = requestAuthRegister('asdf.asdf@unsw.edu.au', 'VeryStr0ngPassword', 'ASDF', 'ASDF');
    quizCreate1(sessiontoken1.token);
    requestQuizTransfer(sessiontoken.token, 'asdf.asdf@unsw.edu.au', quizId.quizId.toString());
    expect(() => requestGetQuizInfoV2(sessiontoken.token, quizId.quizId.toString())).toThrow(HttpError[401]);
    expect(requestGetQuizInfoV2(quizId.quizId, sessiontoken1.token).quizId).toStrictEqual(quizId.quizId);
  });
});
