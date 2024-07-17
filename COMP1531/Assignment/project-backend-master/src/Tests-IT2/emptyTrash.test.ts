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
  const res = request('POST',
    SERVER_URL + '/v1/admin/quiz',
    {
      json: { token, name, description }
    });
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

// /v1/admin/quiz/list GET
// function requestQuizList(token: string) {
//   const res = request('GET', SERVER_URL + '/v1/admin/quiz/list',
//     {
//       qs: { token: token }
//     });
//   return JSON.parse(res.body.toString());
// }

// /v1/admin/quiz/trash GET
function requestViewTrash(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/v1/admin/quiz/trash',
    {
      qs: { token: token }
    }
  );
  return JSON.parse(res.body.toString());
}

// Tests
let token1 : string, quizId1 : number, secondquizId1 : number;
let token2 : string, quizId2 : number;
const ERROR = { error: expect.any(String) };
beforeEach(() => {
  requestClear();

  token1 = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith').token;
  quizId1 = requestQuizCreate(token1, 'My Quiz Name', 'A description of my quiz').quizId;
  secondquizId1 = requestQuizCreate(token1, 'Snd Quiz Name', 'Another quiz').quizId;

  token2 = requestAuthRegister('berb.gray@unsw.edu.au', 'berbgray183', 'Berb', 'Gray').token;
  quizId2 = requestQuizCreate(token2, 'That Quiz Name', 'Yes another description').quizId;
});

describe('Errors', () => {
  test('Error 400 - at least one of the quizzes is not in trash', () => {
    requestTrashQuiz(quizId1, token1);
    const quizIds = [quizId1, secondquizId1];

    const response = request(
      'DELETE',
      SERVER_URL + '/v1/admin/quiz/trash/empty',
      {
        qs: { token: token1, quizIds: JSON.stringify(quizIds) }
      }
    );
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body.toString())).toStrictEqual(ERROR);
  });

  test('Error 401 - token is empty', () => {
    requestTrashQuiz(quizId1, token1);
    requestTrashQuiz(secondquizId1, token1);
    const quizIds = [quizId1, secondquizId1];
    const emptyToken = '';
    const response = request(
      'DELETE',
      SERVER_URL + '/v1/admin/quiz/trash/empty',
      {
        qs: { token: emptyToken, quizIds: JSON.stringify(quizIds) }
      }
    );
    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body.toString())).toStrictEqual(ERROR);
  });
  test('Error 401 - token is invalid', () => {
    requestTrashQuiz(quizId1, token1);
    requestTrashQuiz(secondquizId1, token1);
    const quizIds = [quizId1, secondquizId1];
    const invalidToken = '999999999';
    const response = request(
      'DELETE',
      SERVER_URL + '/v1/admin/quiz/trash/empty',
      {
        qs: { token: invalidToken, quizIds: JSON.stringify(quizIds) }
      }
    );
    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body.toString())).toStrictEqual(ERROR);
  });

  test('Error 403 - token is valid but user does not own one or more of the quizes', () => {
    requestTrashQuiz(quizId1, token1);
    requestTrashQuiz(quizId2, token2);
    const quizIds = [quizId1, quizId2];
    const response = request(
      'DELETE',
      SERVER_URL + '/v1/admin/quiz/trash/empty',
      {
        qs: { token: token1, quizIds: JSON.stringify(quizIds) }
      }
    );
    expect(response.statusCode).toBe(403);
    expect(JSON.parse(response.body.toString())).toStrictEqual(ERROR);
  });
});

describe('Successful Run 200', () => {
  test('Empty trash of two quizzes', () => {
    requestTrashQuiz(quizId1, token1);
    requestTrashQuiz(secondquizId1, token1);
    const quizIds = [quizId1, secondquizId1];
    const response = request(
      'DELETE',
      SERVER_URL + '/v1/admin/quiz/trash/empty',
      {
        qs: { token: token1, quizIds: JSON.stringify(quizIds) }
      }
    );
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body.toString())).toStrictEqual({});

    expect(requestViewTrash(token1)).toStrictEqual({
      quizzes: []
    });
  });
});
