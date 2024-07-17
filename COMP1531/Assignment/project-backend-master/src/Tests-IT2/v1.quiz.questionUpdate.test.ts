import request from 'sync-request-curl';

import { port, url } from '../config.json';
// import { string } from 'yaml/dist/schema/common/string';

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

// /v1/admin/quiz/{quizid}/question POST
function requestQuestionCreate(quizid: number, token: string, questionBody: QuestionBody) {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizid}/question`,
    {
      json: { token, questionBody }
    }
  );
  return JSON.parse(res.body.toString());
}

// /v1/admin/quiz/{quizid} GET
function requestQuizInfo(quizid: number, token: string) {
  const res = request(
    'GET',
    SERVER_URL + `/v1/admin/quiz/${quizid}`,
    {
      qs: { token: token }
    }
  );
  return JSON.parse(res.body.toString());
}

// Tests
let token1 : string, quizId1 : number, questionId1 : number;
let token2 : string, quizId2 : number, questionId2 : number;
const ERROR = { error: expect.any(String) };
const updatedQuestion = {
  question: 'Who is the Monarch of England?',
  duration: 4,
  points: 5,
  answers: [
    {
      answer: 'Prince Charles',
      correct: true
    },
    {
      answer: 'Queen Elizabeth',
      correct: false
    }
  ]
};
const validQuestion = {
  question: 'Favorite icecream flavor?',
  duration: 20,
  points: 8,
  answers: [
    {
      answer: 'Chocolate',
      correct: true
    },
    {
      answer: 'Vanilla',
      correct: false
    }
  ]
};
const longQuestion = {
  question: 'Who is the Monarch of England?',
  duration: 181,
  points: 5,
  answers: [
    {
      answer: 'Prince Charles',
      correct: true
    },
    {
      answer: 'Queen Elizabeth',
      correct: false
    }
  ]
};
beforeEach(() => {
  requestClear();

  token1 = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith').token;
  quizId1 = requestQuizCreate(token1, 'My Quiz Name', 'A description of my quiz').quizId;
  questionId1 = requestQuestionCreate(quizId1, token1, validQuestion).questionId;

  token2 = requestAuthRegister('berb.gray@unsw.edu.au', 'berbgray183', 'Berb', 'Gray').token;
  quizId2 = requestQuizCreate(token2, 'That Quiz Name', 'Yes another description').quizId;
  questionId2 = requestQuestionCreate(quizId2, token2, validQuestion).questionId;
});

describe('Errors', () => {
  describe('Error 400', () => {
    test('Question Id is not valid in quiz', () => {
      const response = request(
        'PUT',
        SERVER_URL + `/v1/admin/quiz/${quizId1}/question/${questionId2}`,
        {
          json: { token: token1, questionBody: updatedQuestion }
        }
      );
      expect(response.statusCode).toStrictEqual(400);
      expect(JSON.parse(response.body.toString())).toStrictEqual(ERROR);
    });
    test('sum of the question durations exceeds 3 minutes', () => {
      const response = request(
        'PUT',
        SERVER_URL + `/v1/admin/quiz/${quizId1}/question/${questionId1}`,
        {
          json: { token: token1, questionBody: longQuestion }
        }
      );
      expect(response.statusCode).toStrictEqual(400);
      expect(JSON.parse(response.body.toString())).toStrictEqual(ERROR);
    });
    const validQName = 'Who is the Monarch of England?';
    const validAnswer = [
      {
        answer: 'Prince Charles',
        correct: true
      },
      {
        answer: 'Queen Elizabeth',
        correct: false
      }
    ];
    const tooManyAnswer = [
      {
        answer: 'Choice 1',
        correct: true
      },
      {
        answer: 'Choice 2',
        correct: false
      },
      {
        answer: 'Choice 3',
        correct: false
      },
      {
        answer: 'Choice 4',
        correct: false
      },
      {
        answer: 'Choice 5',
        correct: false
      },
      {
        answer: 'Choice 6',
        correct: false
      },
      {
        answer: 'Choice 7',
        correct: false
      },
    ];
    const tooLessAnswer = [
      {
        answer: 'Prince Charles',
        correct: true
      }
    ];
    const shortAnswer = [
      {
        answer: 'Prince Charles',
        correct: true
      },
      {
        answer: '',
        correct: false
      }
    ];
    const longAnswer = [
      {
        answer: 'Prince Charles',
        correct: true
      },
      {
        answer: `${'Q'.repeat(31)}`,
        correct: false
      }
    ];
    const dupeAnswer = [
      {
        answer: 'Prince Charles',
        correct: true
      },
      {
        answer: 'Prince Charles',
        correct: false
      }
    ];
    const wrongAnswer = [
      {
        answer: 'Prince Charles',
        correct: false
      },
      {
        answer: 'Queen Elizabeth',
        correct: false
      }
    ];
    test.each([
      { test: 'Question < 5 characters', question: 'Yo', duration: 4, points: 5, answers: validAnswer },
      { test: 'Question > 50 characters', question: `${'Q'.repeat(51)}`, duration: 4, points: 5, answers: validAnswer },
      { test: 'question has more than 6 answers', question: validQName, duration: 4, points: 5, answers: tooManyAnswer },
      { test: 'question has less than 2 answers', question: validQName, duration: 4, points: 5, answers: tooLessAnswer },
      { test: 'question duration not positive', question: validQName, duration: -4, points: 5, answers: validAnswer },
      { test: 'points less than 1', question: validQName, duration: 4, points: 0, answers: validAnswer },
      { test: 'points greater than 10', question: validQName, duration: 4, points: 12, answers: validAnswer },
      { test: 'answer shorter than 1 character', question: validQName, duration: 4, points: 5, answers: shortAnswer },
      { test: 'answer longer than 30 characters', question: validQName, duration: 4, points: 5, answers: longAnswer },
      { test: 'answer strings are duplicates', question: validQName, duration: 4, points: 5, answers: dupeAnswer },
      { test: 'no correct answers', question: validQName, duration: 4, points: 5, answers: wrongAnswer },
    ])('Error: $test', ({ question, duration, points, answers }) => {
      const testQuestion = {
        question: question,
        duration: duration,
        points: points,
        answers: answers
      };
      const response = request(
        'PUT',
        SERVER_URL + `/v1/admin/quiz/${quizId1}/question/${questionId1}`,
        {
          json: { token: token1, questionBody: testQuestion }
        }
      );
      expect(response.statusCode).toStrictEqual(400);
      expect(JSON.parse(response.body.toString())).toStrictEqual(ERROR);
    });
  });

  test('Error 401 - Token is empty', () => {
    const emptyToken = '';
    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question/${questionId1}`,
      {
        json: { token: emptyToken, questionBody: updatedQuestion }
      }
    );
    expect(response.statusCode).toStrictEqual(401);
    expect(JSON.parse(response.body.toString())).toStrictEqual(ERROR);
  });
  test('Error 401 - Token is invalid', () => {
    const invalidToken = '99999999';
    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question/${questionId1}`,
      {
        json: { token: invalidToken, questionBody: updatedQuestion }
      }
    );
    expect(response.statusCode).toStrictEqual(401);
    expect(JSON.parse(response.body.toString())).toStrictEqual(ERROR);
  });

  test('Error 403 - Valid token, but quizId invalid', () => {
    const invalidQuizId = 99999999;
    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${invalidQuizId}/question/${questionId1}`,
      {
        json: { token: token1, questionBody: updatedQuestion }
      }
    );
    expect(response.statusCode).toStrictEqual(403);
    expect(JSON.parse(response.body.toString())).toStrictEqual(ERROR);
  });
  test('Error 403 - Valid token, but user doesnt own quiz', () => {
    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId2}/question/${questionId1}`,
      {
        json: { token: token1, questionBody: updatedQuestion }
      }
    );
    expect(response.statusCode).toStrictEqual(403);
    expect(JSON.parse(response.body.toString())).toStrictEqual(ERROR);
  });
});

test('Successful run 200', () => {
  const response = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizId1}/question/${questionId1}`,
    {
      json: { token: token1, questionBody: updatedQuestion }
    }
  );
  expect(response.statusCode).toStrictEqual(200);
  expect(JSON.parse(response.body.toString())).toStrictEqual({});

  const quizDetails = requestQuizInfo(quizId1, token1);
  expect(quizDetails).toStrictEqual({
    quizId: quizId1,
    name: 'My Quiz Name',
    timeCreated: expect.any(Number),
    timeLastEdited: expect.any(Number),
    description: 'A description of my quiz',
    numQuestions: 1,
    questions: [
      {
        questionId: questionId1,
        question: 'Who is the Monarch of England?',
        duration: 4,
        points: 5,
        answers: [
          {
            answerId: expect.any(Number),
            answer: 'Prince Charles',
            colour: expect.any(String),
            correct: true
          },
          {
            answerId: expect.any(Number),
            answer: 'Queen Elizabeth',
            colour: expect.any(String),
            correct: false
          }
        ]
      }
    ],
    duration: 4
  });
  expect(quizDetails.timeLastEdited).toBeGreaterThanOrEqual(quizDetails.timeCreated);
});
