import request from 'sync-request-curl';

import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;

// Wrapper
// /v1/clear DELETE
function requestClear() {
  const res = request(
    'DELETE',
    SERVER_URL + '/v1/clear'
  );
  return JSON.parse(res.body.toString());
}

// /v1/admin/auth/register POST
function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/register',
    {
      json: { email, password, nameFirst, nameLast }
    }
  );
  return JSON.parse(res.body.toString());
}

// /v1/admin/quiz POST
function requestQuizCreate(token: string, name: string, description: string) {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/quiz',
    {
      json: { token, name, description }
    }
  );
  return JSON.parse(res.body.toString());
}

// /v1/admin/quiz/{quizid} DELETE
function requestTrashQuiz(quizid: number, token: string) {
  const res = request(
    'DELETE',
    SERVER_URL + `/v1/admin/quiz/${quizid}`,
    {
      qs: { token: token }
    }
  );
  return JSON.parse(res.body.toString());
}

// /v1/admin/quiz/trash GET
// function requestViewTrash(token: string) {
//   const res = request(
//     'GET',
//     SERVER_URL + '/v1/admin/quiz/trash',
//     {
//       qs: { token: token }
//     }
//   );
//   return JSON.parse(res.body.toString());
// }

// Tests
let token1 : string, quizId1 : number;
// let token2 : string;
const ERROR = { error: expect.any(String) };
beforeEach(() => {
  requestClear();

  token1 = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith').token;
  quizId1 = requestQuizCreate(token1, 'My Quiz Name', 'A description of my quiz').quizId;
  // secondquizId1 = requestQuizCreate(token1, 'Snd Quiz Name', 'Another quiz').quizId;

  // token2 = requestAuthRegister('berb.gray@unsw.edu.au', 'berbgray183', 'Berb', 'Gray').token;
  // quizId2 = requestQuizCreate(token2, 'That Quiz Name', 'Yes another description').quizId;
});

test('View trash is UnSuccessful (401) - Token is empty or invalid', () => {
  const emptyToken = '';
  const invalidToken = '999999999';

  requestTrashQuiz(quizId1, token1);

  const response1 = request(
    'GET',
    SERVER_URL + '/v1/admin/quiz/trash',
    {
      qs: { token: emptyToken }
    }
  );
  expect(response1.statusCode).toBe(401);
  expect(JSON.parse(response1.body.toString())).toStrictEqual(ERROR);

  const response2 = request(
    'GET',
    SERVER_URL + '/v1/admin/quiz/trash',
    {
      qs: { token: invalidToken }
    }
  );
  expect(response2.statusCode).toBe(401);
  expect(JSON.parse(response2.body.toString())).toStrictEqual(ERROR);
});

test('View trash is Successful (200)', () => {
  requestTrashQuiz(quizId1, token1);
  const response1 = request(
    'GET',
    SERVER_URL + '/v1/admin/quiz/trash',
    {
      qs: { token: parseInt(token1) }
    }
  );

  expect(response1.statusCode).toBe(200);
  expect(JSON.parse(response1.body.toString())).toStrictEqual({
    quizzes: [
      {
        quizId: quizId1,
        name: 'My Quiz Name'
      },
    ]
  });
});
