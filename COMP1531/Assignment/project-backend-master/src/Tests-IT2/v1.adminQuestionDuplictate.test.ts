import request from 'sync-request-curl';

import { port, url } from '../config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  request('DELETE', `${SERVER_URL}/v1/clear`);
});

describe('error duplication', () => {
  test('invalid questionID', () => {
    const resUser = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',

      // Not necessary, since it's empty, though reminder that
      // POST/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          email: 'hayden.smith@unsw.edu.au',
          password: 'haydensmith123',
          nameFirst: 'Hayden',
          nameLast: 'Smith'
        }
      }
    );
    const userData = JSON.parse(resUser.body.toString());

    const resQuiz = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',

      // Not necessary, since it's empty, though reminder that
      // POST/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          token: userData.token,
          name: 'My Quiz Name',
          description: 'A description of my quiz'
        }
      }
    );
    const quizData = JSON.parse(resQuiz.body.toString());
    const resQuestion = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizData.quizId}/question`,

      // Not necessary, since it's empty, though reminder that
      // POST/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          token: userData.token,
          questionBody: {
            question: 'Who is the Monarch of England?',
            duration: 4,
            points: 5,
            answers: [
              {
                answer: 'Prince Charles',
                correct: true
              },
              {
                answer: 'Definitely the wrong answer',
                correct: false
              }
            ]
          }
        }
      }
    );
    const questionData = JSON.parse(resQuestion.body.toString());
    questionData.questionId += 1;
    const answer = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizData.quizId}/question/${questionData.questionId}/duplicate`,

      // Not necessary, since it's empty, though reminder that
      // POST/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          token: userData.token,
        }
      }
    );
    const reply = JSON.parse(answer.body.toString());
    expect(answer.statusCode).toBe(400);
    expect(reply).toStrictEqual({ error: expect.any(String) });
  });
  test('invalid token', () => {
    const resUser = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',

      // Not necessary, since it's empty, though reminder that
      // POST/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          email: 'hayden.smith@unsw.edu.au',
          password: 'haydensmith123',
          nameFirst: 'Hayden',
          nameLast: 'Smith'
        }
      }
    );
    const userData = JSON.parse(resUser.body.toString());

    const resQuiz = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',

      // Not necessary, since it's empty, though reminder that
      // POST/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          token: userData.token,
          name: 'My Quiz Name',
          description: 'A description of my quiz'
        }
      }
    );
    const quizData = JSON.parse(resQuiz.body.toString());

    const resQuestion = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizData.quizId}/question`,

      // Not necessary, since it's empty, though reminder that
      // POST/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          token: userData.token,
          questionBody: {
            question: 'Who is the Monarch of England?',
            duration: 4,
            points: 5,
            answers: [
              {
                answer: 'Prince Charles',
                correct: true
              },
              {
                answer: 'Definitely the wrong answer',
                correct: false
              }
            ]
          }
        }
      }
    );
    const questionData = JSON.parse(resQuestion.body.toString());

    const answer = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizData.quizId}/question/${questionData.questionId}/duplicate`,

      // Not necessary, since it's empty, though reminder that
      // POST/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          token: userData.token + 1,
        }
      }
    );
    const reply = JSON.parse(answer.body.toString());
    expect(answer.statusCode).toBe(401);
    expect(reply).toStrictEqual({ error: expect.any(String) });
  });
  test('empty token', () => {
    const resUser = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',

      // Not necessary, since it's empty, though reminder that
      // POST/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          email: 'hayden.smith@unsw.edu.au',
          password: 'haydensmith123',
          nameFirst: 'Hayden',
          nameLast: 'Smith'
        }
      }
    );
    const userData = JSON.parse(resUser.body.toString());

    const resQuiz = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',

      // Not necessary, since it's empty, though reminder that
      // POST/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          token: userData.token,
          name: 'My Quiz Name',
          description: 'A description of my quiz'
        }
      }
    );
    const quizData = JSON.parse(resQuiz.body.toString());

    const resQuestion = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizData.quizId}/question`,

      // Not necessary, since it's empty, though reminder that
      // POST/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          token: userData.token,
          questionBody: {
            question: 'Who is the Monarch of England?',
            duration: 4,
            points: 5,
            answers: [
              {
                answer: 'Prince Charles',
                correct: true
              },
              {
                answer: 'Definitely the wrong answer',
                correct: false
              }
            ]
          }
        }
      }
    );
    const questionData = JSON.parse(resQuestion.body.toString());

    const answer = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizData.quizId}/question/${questionData.questionId}/duplicate`,

      // Not necessary, since it's empty, though reminder that
      // POST/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          token: '',
        }
      }
    );
    const reply = JSON.parse(answer.body.toString());
    expect(answer.statusCode).toBe(401);
    expect(reply).toStrictEqual({ error: expect.any(String) });
  });
  test('invalid quizId', () => {
    const resUser = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',

      // Not necessary, since it's empty, though reminder that
      // POST/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          email: 'hayden.smith@unsw.edu.au',
          password: 'haydensmith123',
          nameFirst: 'Hayden',
          nameLast: 'Smith'
        }
      }
    );
    const userData = JSON.parse(resUser.body.toString());

    const resQuiz = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',

      // Not necessary, since it's empty, though reminder that
      // POST/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          token: userData.token,
          name: 'My Quiz Name',
          description: 'A description of my quiz'
        }
      }
    );
    const quizData = JSON.parse(resQuiz.body.toString());

    const resQuestion = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizData.quizId}/question`,

      // Not necessary, since it's empty, though reminder that
      // POST/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          token: userData.token,
          questionBody: {
            question: 'Who is the Monarch of England?',
            duration: 4,
            points: 5,
            answers: [
              {
                answer: 'Prince Charles',
                correct: true
              },
              {
                answer: 'Definitely the wrong answer',
                correct: false
              }
            ]
          }
        }
      }
    );
    const questionData = JSON.parse(resQuestion.body.toString());

    quizData.quizId += 1;

    const answer = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizData.quizId}/question/${questionData.questionId}/duplicate`,

      // Not necessary, since it's empty, though reminder that
      // POST/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          token: userData.token,
        }
      }
    );
    const reply = JSON.parse(answer.body.toString());
    expect(answer.statusCode).toBe(403);
    expect(reply).toStrictEqual({ error: expect.any(String) });
  });
  test('user does not own this quiz', () => {
    const resUser = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',

      // Not necessary, since it's empty, though reminder that
      // POST/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          email: 'hayden.smith@unsw.edu.au',
          password: 'haydensmith123',
          nameFirst: 'Hayden',
          nameLast: 'Smith'
        }
      }
    );
    const userData = JSON.parse(resUser.body.toString());

    const resUser2 = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',

      // Not necessary, since it's empty, though reminder that
      // POST/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          email: 'maximillianmaxi31@gmil.com',
          password: 'XpertGamer123',
          nameFirst: 'Xtremely',
          nameLast: 'handsome'
        }
      }
    );
    const userData2 = JSON.parse(resUser2.body.toString());

    const resQuiz = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',

      // Not necessary, since it's empty, though reminder that
      // POST/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          token: userData.token,
          name: 'My Quiz Name',
          description: 'A description of my quiz'
        }
      }
    );
    const quizData = JSON.parse(resQuiz.body.toString());

    // const resQuiz2 = request(
    //   'POST',
    //   SERVER_URL + '/v1/admin/quiz',

    //   // Not necessary, since it's empty, though reminder that
    //   // POST/DELETE is `qs`, PUT/POST is `json`
    //   {
    //     json: {
    //       token: userData2.token,
    //       name: 'better quiz',
    //       description: 'my quiz is the best'
    //     }
    //   }
    // );
    // const quizData2 = JSON.parse(resQuiz2.body.toString());

    const resQuestion = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizData.quizId}/question`,

      // Not necessary, since it's empty, though reminder that
      // POST/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          token: userData.token,
          questionBody: {
            question: 'Who is the Monarch of England?',
            duration: 4,
            points: 5,
            answers: [
              {
                answer: 'Prince Charles',
                correct: true
              },
              {
                answer: 'Definitely the wrong answer',
                correct: false
              }
            ]
          }
        }
      }
    );
    const questionData = JSON.parse(resQuestion.body.toString());

    // const resQuestion2 = request(
    //   'POST',
    //   SERVER_URL + `/v1/admin/quiz/${quizData2.quizId}/question`,

    //   // Not necessary, since it's empty, though reminder that
    //   // POST/DELETE is `qs`, PUT/POST is `json`
    //   {
    //     json: {
    //       token: userData2.token,
    //       questionBody: {
    //         question: 'Who is the Monarch of England?',
    //         duration: 4,
    //         points: 5,
    //         answers: [
    //           {
    //             answer: 'Prince Charles',
    //             correct: true
    //           },
    //           {
    //             answer: 'Definitely the wrong answer',
    //             correct: false
    //           }
    //         ]
    //       }
    //     }
    //   }
    // );
    // const questionData2 = JSON.parse(resQuestion2.body.toString());

    const answer = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizData.quizId}/question/${questionData.questionId}/duplicate`,

      // Not necessary, since it's empty, though reminder that
      // POST/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          token: userData2.token,
        }
      }
    );
    const reply = JSON.parse(answer.body.toString());
    expect(answer.statusCode).toBe(403);
    expect(reply).toStrictEqual({ error: expect.any(String) });
  });
});

describe('success duplication', () => {
  test('sucessfull', () => {
    const resUser = request(
      'POST',
      SERVER_URL + '/v1/admin/auth/register',

      // Not necessary, since it's empty, though reminder that
      // POST/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          email: 'hayden.smith@unsw.edu.au',
          password: 'haydensmith123',
          nameFirst: 'Hayden',
          nameLast: 'Smith'
        }
      }
    );
    const userData = JSON.parse(resUser.body.toString());

    const resQuiz = request(
      'POST',
      SERVER_URL + '/v1/admin/quiz',

      // Not necessary, since it's empty, though reminder that
      // POST/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          token: userData.token,
          name: 'My Quiz Name',
          description: 'A description of my quiz'
        }
      }
    );
    const quizData = JSON.parse(resQuiz.body.toString());

    const resQuestion = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizData.quizId}/question`,

      // Not necessary, since it's empty, though reminder that
      // POST/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          token: userData.token,
          questionBody: {
            question: 'Who is the Monarch of England?',
            duration: 4,
            points: 5,
            answers: [
              {
                answer: 'Prince Charles',
                correct: true
              },
              {
                answer: 'Definitely the wrong answer',
                correct: false
              }
            ]
          }
        }
      }
    );
    const questionData = JSON.parse(resQuestion.body.toString());

    const answer = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizData.quizId}/question/${questionData.questionId}/duplicate`,

      // Not necessary, since it's empty, though reminder that
      // POST/DELETE is `qs`, PUT/POST is `json`
      {
        json: {
          token: userData.token,
        }
      }
    );
    const reply = JSON.parse(answer.body.toString());
    expect(reply).toStrictEqual({ newQuestionId: expect.any(Number) });
  });
});
