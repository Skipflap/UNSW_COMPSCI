import request from 'sync-request-curl';

import { port, url } from '../config.json';
const SERVER_URL = `${url}:${port}`;

interface QuestionBody {
    question: string,
    duration: number,
    points: number,
    answers: Answers[]
}

interface Answers {
    answer: string,
    correct: boolean,
}

// Wrappers
// /v1/clear DELETE
export function requestClear() {
  const res = request(
    'DELETE',
    SERVER_URL + '/v1/clear'
  );
  const bodyString = res.body.toString();
  const bodyObject = JSON.parse(bodyString);

  return { status: res.statusCode, bodyObject };
}

// /v1/admin/auth/register POST
export function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/register',
    {
      json: { email, password, nameFirst, nameLast }
    }
  );
  const bodyString = res.body.toString();
  const bodyObject = JSON.parse(bodyString);

  return { status: res.statusCode, bodyObject };
}

// /v1/admin/quiz POST
export function requestQuizCreate(token: string, name: string, description: string) {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/quiz',
    {
      json: { token, name, description }
    }
  );
  const bodyString = res.body.toString();
  const bodyObject = JSON.parse(bodyString);

  return { status: res.statusCode, bodyObject };
}

// /v1/admin/user/details GET
export function requestUserDetails(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/v1/admin/user/details',
    {
      qs: { token: token }
    }
  );
  const bodyString = res.body.toString();
  const bodyObject = JSON.parse(bodyString);

  return { status: res.statusCode, bodyObject };
}

// /v1/admin/quiz/{quizid} GET
export function requestQuizDetails(quizid: number, token: string) {
  const res = request(
    'GET',
    SERVER_URL + `/v1/admin/quiz/${quizid}`,
    {
      qs: { token: token }
    }
  );
  const bodyString = res.body.toString();
  const bodyObject = JSON.parse(bodyString);

  return { status: res.statusCode, bodyObject };
}

// /v1/admin/user/details PUT
export function requestUserDetailsUpdate(token: string, email: string, nameFirst: string, nameLast: string) {
  const res = request(
    'PUT',
    SERVER_URL + '/v1/admin/user/details',
    {
      json: { token, email, nameFirst, nameLast }
    }
  );

  const bodyString = res.body.toString();
  const bodyObject = JSON.parse(bodyString);

  return { status: res.statusCode, bodyObject };
}

// /v1/admin/auth/login POST
export function requestAuthLogin(email: string, password: string) {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/login',
    {
      json: { email, password }
    }
  );
  const bodyString = res.body.toString();
  const bodyObject = JSON.parse(bodyString);

  return { status: res.statusCode, bodyObject };
}

// /v1/admin/user/password PUT
export function requestUserPasswordUpdate(token: string, oldPassword: string, newPassword: string) {
  const res = request(
    'PUT',
    SERVER_URL + '/v1/admin/user/password',
    {
      json: { token, oldPassword, newPassword }
    }
  );

  const bodyString = res.body.toString();
  const bodyObject = JSON.parse(bodyString);

  return { status: res.statusCode, bodyObject };
}

// /v1/admin/quiz/{quizid}/question POST
export function requestQuizQuestionCreate(quizid: number, token: string, questionBody: QuestionBody) {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizid}/question`,
    {
      json: { token, questionBody }
    }
  );
  const bodyString = res.body.toString();
  const bodyObject = JSON.parse(bodyString);

  return { status: res.statusCode, bodyObject };
}

// /v1/clear DELETE
export function requestQuizQuestionDelete(quizid: number, questionid: number, token: string) {
  const res = request(
    'DELETE',
    SERVER_URL + `/v1/admin/quiz/${quizid}/question/${questionid}`,
    {
      qs: { token }
    }
  );

  const bodyString = res.body.toString();
  const bodyObject = JSON.parse(bodyString);

  return { status: res.statusCode, bodyObject };
}

// /v1/admin/quiz/{quizid}/question/{questionid}/move PUT
export function requestQuizQuestionMove(quizid: number, questionid: number, token: string, newPosition: number) {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizid}/question/${questionid}/move`,
    {
      json: { token, newPosition }
    }
  );

  const bodyString = res.body.toString();
  const bodyObject = JSON.parse(bodyString);

  return { status: res.statusCode, bodyObject };
}
