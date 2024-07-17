import request from 'sync-request-curl';

import { port, url } from '../config.json';
const SERVER_URL = `${url}:${port}`;

// Wrappers
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

// Tests
// const ERROR = { error: expect.any(String) };
let token1: string;
//, quizId1: number, quizId2: number , token2: string;

test('Check correct return output', () => {
  expect(requestClear()).toStrictEqual({});
});

test('Check the datastore is reset', () => { // waiting for userdetails and trashview
  token1 = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith').token;
  requestQuizCreate(token1, 'My Quiz Name', 'A description of my quiz');
  requestQuizCreate(token1, 'My Quiz Name', 'A description of my quiz');
  requestClear();

  const response2 = request('GET', SERVER_URL + '/v1/admin/quiz/list',
    {
      qs: { token: parseInt(token1) }
    });
  expect(response2.statusCode).toStrictEqual(401);
});
