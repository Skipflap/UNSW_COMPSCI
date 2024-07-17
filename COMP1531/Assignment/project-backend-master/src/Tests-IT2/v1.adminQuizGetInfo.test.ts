import request from 'sync-request-curl';

import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;

function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/register',
    {
      json: { email, password, nameFirst, nameLast }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}

function requestQuizCreate(token: string, name: string, description: string) {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/quiz',
    {
      json: { token, name, description }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}

// function requestGetUserDetails(testtoken: string) {
//   const res = request('GET', SERVER_URL + '/v1/admin/user/details', {
//     qs: {
//       token: testtoken,
//     }
//   });
//   return {
//     body: JSON.parse(res.body.toString()),
//     statusCode: res.statusCode
//   };
// }

function requestGetQuizInfo(quizid: number, testtoken: string) {
  const res = request('GET', `${SERVER_URL}/v1/admin/quiz/${quizid}`, {
    qs: { token: testtoken } // Include token in the request
  });
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}

let user1SessionToken: string, user2SessionToken: string, firstQuizUser1: number, firstQuizUser2: number;

beforeEach(() => {
  request('DELETE', `${SERVER_URL}/v1/clear`);

  // user 1 has 2 quizzes.
  user1SessionToken = requestAuthRegister('lebron724@gmail.com', 'ball1234', 'Lebron', 'James').body.token;
  firstQuizUser1 = requestQuizCreate(user1SessionToken, 'Bball', '10 questions on Basketball Teams').body.quizId;
  requestQuizCreate(user1SessionToken, 'Highlights', 'Quiz on basketball highlights');

  // user 2 has 1 quiz.
  user2SessionToken = requestAuthRegister('messi448@gmail.com', 'soccer2312', 'Leo', 'Messi').body.token;
  firstQuizUser2 = requestQuizCreate(user2SessionToken, 'Soccer', '5 questions of Soccer teams').body.quizId;
});

describe('Error with quizInfo', () => {
  test('ERROR (401) - Token is empty or invalid', () => {
    request('DELETE', `${SERVER_URL}/v1/clear`);
    const sessionToken = requestAuthRegister('lebron724@gmail.com', 'ball1234', 'Lebron', 'James').body.token;
    const quizId = requestQuizCreate(user1SessionToken, 'Bball', '10 questions on Basketball Teams').body.quizId;
    const inValidToken = sessionToken + 'impossible';
    const emptyToken = '';

    const getInfoResponse = requestGetQuizInfo(quizId, inValidToken);
    const getInfoResponse1 = requestGetQuizInfo(quizId, emptyToken);

    expect(getInfoResponse.statusCode).toStrictEqual(401);
    expect(getInfoResponse1.statusCode).toStrictEqual(401);

    expect(getInfoResponse.body).toStrictEqual({ error: expect.any(String) });
    expect(getInfoResponse1.body).toStrictEqual({ error: expect.any(String) });
  });

  test('quizInfo is UnSuccessful (403) - Valid token but user does not own the quiz', () => {
    const response2 = requestGetQuizInfo(firstQuizUser1, user2SessionToken);
    const response3 = requestGetQuizInfo(firstQuizUser2, user1SessionToken);

    expect(response2.statusCode).toStrictEqual(403);
    expect(response3.statusCode).toStrictEqual(403);

    expect(response2.body).toStrictEqual({ error: expect.any(String) });
    expect(response3.body).toStrictEqual({ error: expect.any(String) });
  });

  test('quizInfo is UnSuccessful (403) - Valid token but user but quiz doesnt exist', () => {
    request('DELETE', `${SERVER_URL}/v1/clear`);
    const sessionToken = requestAuthRegister('lebron724@gmail.com', 'ball1234', 'Lebron', 'James').body.token;
    const quizId = requestQuizCreate(user1SessionToken, 'Bball', '10 questions on Basketball Teams').body.quizId;
    const response = requestGetQuizInfo(quizId + 1, sessionToken);

    expect(response.statusCode).toStrictEqual(403);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
  });
});

describe('Correct Tests', () => {
  test('quizInfo with User with one quiz', () => {
    const response5 = requestGetQuizInfo(firstQuizUser2, user2SessionToken);

    expect(response5.body).toStrictEqual({
      quizId: firstQuizUser2,
      name: 'Soccer',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      numQuestions: 0,
      description: '5 questions of Soccer teams',
      questions: [],
      duration: 0,
    });

    expect(response5.statusCode).toStrictEqual(200);
  });

  test('quizInfo with User owning two quizzes quiz', () => {
    const response6 = requestGetQuizInfo(firstQuizUser1, user1SessionToken);

    expect(response6.body).toStrictEqual(
      {
        quizId: firstQuizUser1,
        name: 'Bball',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        numQuestions: 0,
        description: '10 questions on Basketball Teams',
        questions: [],
        duration: 0,
      }

    );

    expect(response6.statusCode).toStrictEqual(200);
  });
});
