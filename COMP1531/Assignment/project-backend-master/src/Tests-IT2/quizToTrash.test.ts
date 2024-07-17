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
// function requestTrashQuiz(quizid: number, token: string) {
//   const res = request(
//     'DELETE',
//     SERVER_URL + `/v1/admin/quiz/${quizid}`,
//     {
//       qs: { token: token }
//     }
//   );
//   return JSON.parse(res.body.toString());
// }

// /v1/admin/quiz/list GET
function requestQuizList(token: string) {
  const res = request('GET', SERVER_URL + '/v1/admin/quiz/list',
    {
      qs: { token: token }
    });
  return JSON.parse(res.body.toString());
}

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

// /v1/admin/quiz/{quizid} GET
// function requestQuizInfo(quizid: number, token: string) {
//   const res = request(
//     'GET',
//     SERVER_URL + `/v1/admin/quiz/${quizid}`,
//     {
//       qs: { token: token }
//     }
//   );
//   return JSON.parse(res.body.toString());
// }

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

// check time last edited
describe('Delete Quiz is Successful (200)', () => {
  test('Deleting Quiz1 from token1', () => {
    const { body, statusCode } = request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quizId1}`,
      {
        qs: { token: token1 }
      }
    );

    expect(statusCode).toBe(200);
    expect(JSON.parse(body.toString())).toStrictEqual({});

    expect(requestQuizList(token1).quizzes[0]).toStrictEqual({ quizId: secondquizId1, name: 'Snd Quiz Name' });
    expect(requestViewTrash(token1).quizzes[0]).toStrictEqual({ quizId: quizId1, name: 'My Quiz Name' });
  });

  test('Deleting multiple quizzes', () => {
    const response1 = request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quizId1}`,
      {
        qs: { token: token1 }
      }
    );
    expect(response1.statusCode).toBe(200);
    expect(JSON.parse(response1.body.toString())).toStrictEqual({});

    const response2 = request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quizId2}`,
      {
        qs: { token: token2 }
      }
    );
    expect(response2.statusCode).toBe(200);
    expect(JSON.parse(response2.body.toString())).toStrictEqual({});

    expect(requestQuizList(token1).quizzes[0]).toStrictEqual({ quizId: secondquizId1, name: 'Snd Quiz Name' });
    expect(requestViewTrash(token1).quizzes[0]).toStrictEqual({ quizId: quizId1, name: 'My Quiz Name' });

    expect(requestQuizList(token2)).toStrictEqual({ quizzes: [] });
    expect(requestViewTrash(token2).quizzes[0]).toStrictEqual({ quizId: quizId2, name: 'That Quiz Name' });
  });
});

test('Delete Quiz is UnSuccessful (401) - Token is empty or invalid', () => {
  const emptyToken = '';
  const invalidToken = '999999999';

  const response1 = request(
    'DELETE',
    SERVER_URL + `/v1/admin/quiz/${quizId1}`,
    {
      qs: { token: emptyToken }
    }
  );
  expect(response1.statusCode).toBe(401);
  expect(JSON.parse(response1.body.toString())).toStrictEqual(ERROR);

  const response2 = request(
    'DELETE',
    SERVER_URL + `/v1/admin/quiz/${quizId1}`,
    {
      qs: { token: invalidToken }
    }
  );
  expect(response2.statusCode).toBe(401);
  expect(JSON.parse(response2.body.toString())).toStrictEqual(ERROR);
});

test('Delete Quiz is UnSuccessful (403) - Valid token but quiz ID invalid', () => {
  const invalidQuizId = 999999999;

  const { body, statusCode } = request(
    'DELETE',
    SERVER_URL + `/v1/admin/quiz/${invalidQuizId}`,
    {
      qs: { token: token1 }
    }
  );
  expect(statusCode).toBe(403);
  expect(JSON.parse(body.toString())).toStrictEqual(ERROR);
});

test('Delete Quiz is UnSuccessful (403) - Valid token but user does not own the quiz', () => {
  const { body, statusCode } = request(
    'DELETE',
    SERVER_URL + `/v1/admin/quiz/${quizId2}`,
    {
      qs: { token: token1 }
    }
  );
  expect(statusCode).toBe(403);
  expect(JSON.parse(body.toString())).toStrictEqual(ERROR);
});
