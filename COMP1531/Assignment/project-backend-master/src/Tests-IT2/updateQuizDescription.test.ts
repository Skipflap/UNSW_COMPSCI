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

function requestUpdateQuizDescription(quizid: number, testtoken: string, newdescription: string) {
  const res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quizid}/description`, {

    json: { token: testtoken, description: newdescription }
  });
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}

let user1SessionToken, user2SessionToken, firstQuizUser1, secondQuizUser1, firstQuizUser2;

beforeEach(() => {
  request('DELETE', `${SERVER_URL}/v1/clear`);

  // user 1 has 2 quizzes.
  user1SessionToken = requestAuthRegister('lebron724@gmail.com', 'ball1234', 'Lebron', 'James').body.token;
  firstQuizUser1 = requestQuizCreate(user1SessionToken, 'Bball', '10 questions on Basketball Teams').body;
  secondQuizUser1 = requestQuizCreate(user1SessionToken, 'Highlights', 'Quiz on basketball highlights').body;

  // user 2 has 1 quiz.
  user2SessionToken = requestAuthRegister('messi448@gmail.com', 'soccer2312', 'Leo', 'Messi').body.token;
  firstQuizUser2 = requestQuizCreate(user2SessionToken, 'Soccer', '5 questions of Soccer teams').body;
});

describe('ERRORS', () => {
  test('ERROR (400) - Description is more than 100 characters in length', () => {
    const inValidDes = '10 questions on Basketball Teams 10 questions on Basketball Teams 10 questions on Basketball Teams 1010';
    const getUpdateDesResponse = requestUpdateQuizDescription(firstQuizUser1.quizId, user1SessionToken, inValidDes);
    expect(getUpdateDesResponse.statusCode).toStrictEqual(400);
    expect(getUpdateDesResponse.body).toStrictEqual({ error: expect.any(String) });
  });

  test('ERROR (401) - Token is empty or invalid', () => {
    const validDes = '25 questions on Basketball Teams';

    const inValidToken = '-1';
    const emptyToken = '';
    const getUpdateDesResponse1 = requestUpdateQuizDescription(firstQuizUser1.quizId, inValidToken, validDes);
    const getUpdateDesResponse2 = requestUpdateQuizDescription(firstQuizUser1.quizId, emptyToken, validDes);

    expect(getUpdateDesResponse1.statusCode).toStrictEqual(401);
    expect(getUpdateDesResponse1.body).toStrictEqual({ error: expect.any(String) });
    expect(getUpdateDesResponse2.statusCode).toStrictEqual(401);
    expect(getUpdateDesResponse2.body).toStrictEqual({ error: expect.any(String) });
  });

  test('ERROR (403) - Valid token but either userId or quizId is invalid', () => {
    const validDes1 = '25 questions on Basketball Teams';
    const inValidQuizId = -1;

    const getUpdateDesResponse3 = requestUpdateQuizDescription(inValidQuizId, user1SessionToken, validDes1);

    expect(getUpdateDesResponse3.statusCode).toStrictEqual(403);
    expect(getUpdateDesResponse3.body).toStrictEqual({ error: expect.any(String) });

    const getUpdateDesResponse4 = requestUpdateQuizDescription(firstQuizUser2.quizId, user1SessionToken, validDes1);

    expect(getUpdateDesResponse4.statusCode).toStrictEqual(403);
    expect(getUpdateDesResponse4.body).toStrictEqual({ error: expect.any(String) });
  });
});

describe('Correct testing for updateQuizDescription', () => {
  test('User owning two quizzes correct update', () => {
    const validDes2 = '25 questions on Basketball Teams';
    const validDes3 = 'The best ball highlights';

    requestUpdateQuizDescription(firstQuizUser1.quizId, user1SessionToken, validDes2);
    requestUpdateQuizDescription(secondQuizUser1.quizId, user1SessionToken, validDes3);

    const quizShowres = requestGetQuizInfo(firstQuizUser1.quizId, user1SessionToken);
    const quizShowres1 = requestGetQuizInfo(secondQuizUser1.quizId, user1SessionToken);

    expect(quizShowres.body).toStrictEqual({
      quizId: firstQuizUser1.quizId,
      name: 'Bball',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      numQuestions: 0,
      description: validDes2,
      questions: [],
      duration: 0,
    });

    expect(quizShowres1.body).toStrictEqual({
      quizId: secondQuizUser1.quizId,
      name: 'Highlights',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      numQuestions: 0,
      description: validDes3,
      questions: [],
      duration: 0,
    });
  });

  test('User owning one quiz correct update', () => {
    const validDes4 = '5 questions of Soccer teams';
    requestUpdateQuizDescription(firstQuizUser2.quizId, user2SessionToken, validDes4);

    const quizShowres2 = requestGetQuizInfo(firstQuizUser2.quizId, user2SessionToken);

    expect(quizShowres2.body).toStrictEqual({
      quizId: firstQuizUser2.quizId,
      name: 'Soccer',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      numQuestions: 0,
      description: validDes4,
      questions: [],
      duration: 0,
    });
  });
});
