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

function requestUpdateQuizName(quizid: number, testtoken: string, newname: string) {
  const res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quizid}/name`, {

    json: { token: testtoken, name: newname }
  });
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}

let user1SessionToken, user2SessionToken, firstQuizUser1, firstQuizUser2;

beforeEach(() => {
  request('DELETE', `${SERVER_URL}/v1/clear`);

  // user 3 has 2 quizzes.
  user1SessionToken = requestAuthRegister('lebron724@gmail.com', 'ball1234', 'Lebron', 'James').body.token;
  firstQuizUser1 = requestQuizCreate(user1SessionToken, 'Bball', '10 questions on Basketball Teams').body;
  requestQuizCreate(user1SessionToken, 'Highlights', 'Quiz on basketball highlights');

  // user 2 has 1 quiz.
  user2SessionToken = requestAuthRegister('messi448@gmail.com', 'soccer2312', 'Leo', 'Messi').body.token;
  firstQuizUser2 = requestQuizCreate(user2SessionToken, 'Soccer', '5 questions of Soccer teams').body;
});

describe('ERROR 400', () => {
  test('ERROR (400) - Name contains invalid characters', () => {
    const inValidName = 'BBALLL!!!!';
    const getUpdateNameResponse = requestUpdateQuizName(firstQuizUser1.quizId, user1SessionToken, inValidName);
    expect(getUpdateNameResponse.statusCode).toStrictEqual(400);
    expect(getUpdateNameResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('ERROR (400) - Name to short to long', () => {
    const inValidName1 = 'hi';
    const inValidName2 = 'Lebrons James best highlights of his career';

    const getUpdateNameResponse1 = requestUpdateQuizName(firstQuizUser1.quizId, user1SessionToken, inValidName1);
    const getUpdateNameResponse2 = requestUpdateQuizName(firstQuizUser1.quizId, user1SessionToken, inValidName2);
    expect(getUpdateNameResponse1.statusCode).toStrictEqual(400);
    expect(getUpdateNameResponse1.body).toStrictEqual({ error: expect.any(String) });
    expect(getUpdateNameResponse2.statusCode).toStrictEqual(400);
    expect(getUpdateNameResponse2.body).toStrictEqual({ error: expect.any(String) });
  });

  test('ERROR (400) - Name is already in used in another quiz that is owned by you', () => {
    const repeatedName = 'Highlights';

    const getUpdateNameResponse3 = requestUpdateQuizName(firstQuizUser1.quizId, user1SessionToken, repeatedName);
    expect(getUpdateNameResponse3.statusCode).toStrictEqual(400);
    expect(getUpdateNameResponse3.body).toStrictEqual({ error: expect.any(String) });
  });
});

describe('ERROR 401', () => {
  test('ERROR (401) - Empty or Invalid Token', () => {
    const inValidToken = '-1';
    const emptyToken = '';

    const validName = 'Do you know Bball';

    const getUpdateNameResponse4 = requestUpdateQuizName(firstQuizUser1.quizId, inValidToken, validName);
    const getUpdateNameResponse5 = requestUpdateQuizName(firstQuizUser1.quizId, emptyToken, validName);

    expect(getUpdateNameResponse4.statusCode).toStrictEqual(401);
    expect(getUpdateNameResponse4.body).toStrictEqual({ error: expect.any(String) });
    expect(getUpdateNameResponse5.statusCode).toStrictEqual(401);
    expect(getUpdateNameResponse5.body).toStrictEqual({ error: expect.any(String) });
  });
});

describe('ERROR 403 - Valid token but invalid quizid/does not own quiz', () => {
  test('ERROR (403) - Valid token but invalid quizid', () => {
    const validName1 = 'Do you know Bball';

    const inValidQuizId = -1;
    const getUpdateNameResponse6 = requestUpdateQuizName(inValidQuizId, user1SessionToken, validName1);

    expect(getUpdateNameResponse6.statusCode).toStrictEqual(403);
    expect(getUpdateNameResponse6.body).toStrictEqual({ error: expect.any(String) });
  });

  test('ERROR (403) - Valid token but user does not own quiz', () => {
    const validName2 = 'Do you know Bball';

    const getUpdateNameResponse7 = requestUpdateQuizName(firstQuizUser2.quizId, user1SessionToken, validName2);

    expect(getUpdateNameResponse7.statusCode).toStrictEqual(403);
    expect(getUpdateNameResponse7.body).toStrictEqual({ error: expect.any(String) });
  });
});

describe('Correct testing for updateQuizName', () => {
  test('User owning two quizzes correct update', () => {
    const validName3 = 'Do you know Bball';

    const getUpdateNameResponse7 = requestUpdateQuizName(firstQuizUser1.quizId, user1SessionToken, validName3);

    expect(getUpdateNameResponse7.statusCode).toStrictEqual(200);
    expect(getUpdateNameResponse7.body).toStrictEqual({});

    const quizShowres = requestGetQuizInfo(firstQuizUser1.quizId, user1SessionToken);

    expect(quizShowres.body).toStrictEqual({
      quizId: firstQuizUser1.quizId,
      name: validName3,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      numQuestions: 0,
      description: '10 questions on Basketball Teams',
      questions: [],
      duration: 0,
    });
  });
});
