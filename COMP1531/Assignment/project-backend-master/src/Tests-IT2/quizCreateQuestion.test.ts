import request from 'sync-request-curl';
import { QuestionBody } from '../interface';

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

function requestCreateQuizQuestion(quizid: number, testtoken: string, questionDetails: QuestionBody) {
  const res = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizid}/question`, {

    json: {
      token: testtoken,
      questionBody: questionDetails
    }
  });
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}

let user1SessionToken, user2SessionToken, firstQuizUser1, firstQuizUser2;

beforeEach(() => {
  request('DELETE', `${SERVER_URL}/v1/clear`);

  // user 1 has 2 quizzes.
  user1SessionToken = requestAuthRegister('lebron724@gmail.com', 'ball1234', 'Lebron', 'James').body.token;
  firstQuizUser1 = requestQuizCreate(user1SessionToken, 'Bball', '10 questions on Basketball Teams').body;
  // secondQuizUser1 = requestQuizCreate(user1SessionToken, 'Highlights', 'Quiz on basketball highlights').body;

  user2SessionToken = requestAuthRegister('messi448@gmail.com', 'soccer2312', 'Leo', 'Messi').body.token;
  firstQuizUser2 = requestQuizCreate(user2SessionToken, 'Soccer', '5 questions of Soccer teams').body;
});

describe('ERROR 400', () => {
  test('Question string is less than 5 characters in length or greater than 50 characters in length', () => {
    const qShort = 'TorF';
    const qLong = 'What year did Lebron James start playing basketball professionally';

    const questionShort = {
      questionId: 1,
      question: qShort,
      duration: 5,
      points: 10,
      answers: [
        {
          answer: '2000',
          correct: true
        },

        {
          answer: '1995',
          correct: false
        },
      ]
    };

    const questionLong = {
      questionId: 1,
      question: qLong,
      duration: 5,
      points: 10,
      answers: [
        {
          answer: '2000',
          correct: true
        },

        {
          answer: '1995',
          correct: false
        },
      ]
    };

    const createQuizRes = requestCreateQuizQuestion(firstQuizUser1.quizId, user1SessionToken, questionShort);
    const createQuizRes1 = requestCreateQuizQuestion(firstQuizUser1.quizId, user1SessionToken, questionLong);

    expect(createQuizRes.statusCode).toStrictEqual(400);
    expect(createQuizRes.body).toStrictEqual({ error: expect.any(String) });
    expect(createQuizRes1.statusCode).toStrictEqual(400);
    expect(createQuizRes1.body).toStrictEqual({ error: expect.any(String) });
  });

  test('The question has more than 6 answers or less than 2 answers', () => {
    const questionAnsShort = {
      questionId: 1,
      timeCreated: 1000000,
      timeLastEdited: 100000,
      question: 'What year did Lebron James play',
      duration: 5,
      points: 10,
      answers: [
        {
          answer: '2000',
          correct: true
        },

      ]
    };

    const questionAnsLong = {
      questionId: 1,
      timeCreated: 1000000,
      timeLastEdited: 100000,
      question: 'What year did Lebron James play',
      duration: 5,
      points: 10,
      answers: [
        {
          answer: '2000',
          correct: true
        },

        {
          answer: '1995',
          correct: false
        },

        {
          answer: '2727',
          correct: false
        },

        {
          answer: '1737',
          correct: false
        },

        {
          answer: '1847',
          correct: false
        },

        {
          answer: '3717',
          correct: false
        },

        {
          answer: '2024',
          correct: false
        },

      ]
    };

    const createQuizRes2 = requestCreateQuizQuestion(firstQuizUser1.quizId, user1SessionToken, questionAnsShort);
    const createQuizRes3 = requestCreateQuizQuestion(firstQuizUser1.quizId, user1SessionToken, questionAnsLong);

    expect(createQuizRes2.statusCode).toStrictEqual(400);
    expect(createQuizRes2.body).toStrictEqual({ error: expect.any(String) });
    expect(createQuizRes3.statusCode).toStrictEqual(400);
    expect(createQuizRes3.body).toStrictEqual({ error: expect.any(String) });
  });

  test('The question duration is not a positive number', () => {
    const questionDur = {
      questionId: 1,
      question: 'What year did Lebron James play',
      duration: -1,
      points: 10,
      answers: [
        {
          answerId: 1,
          answer: '2000',
          colour: 'red',
          correct: true
        },

        {
          answerId: 2,
          answer: '1995',
          colour: 'blue',
          correct: false
        },

      ]
    };

    const createQuizRes4 = requestCreateQuizQuestion(firstQuizUser1.quizId, user1SessionToken, questionDur);

    expect(createQuizRes4.statusCode).toStrictEqual(400);
    expect(createQuizRes4.body).toStrictEqual({ error: expect.any(String) });
  });

  test('The sum of the question durations in the quiz exceeds 3 minutes', () => {
    const questionDur1 = {
      questionId: 1,
      question: 'What year did Lebron James play',
      duration: 181,
      points: 10,
      answers: [
        {
          answerId: 1,
          answer: '2000',
          colour: 'red',
          correct: true
        },

        {
          answerId: 2,
          answer: '1995',
          colour: 'blue',
          correct: false
        },

      ]
    };

    const createQuizRes5 = requestCreateQuizQuestion(firstQuizUser1.quizId, user1SessionToken, questionDur1);
    expect(createQuizRes5.statusCode).toStrictEqual(400);
    expect(createQuizRes5.body).toStrictEqual({ error: expect.any(String) });
  });

  test('The points awarded for the question are less than 1 or greater than 10', () => {
    const questionGreater = {
      questionId: 1,
      question: 'What year did Lebron James play',
      duration: 3,
      points: 20,
      answers: [
        {
          answerId: 1,
          answer: '2000',
          colour: 'red',
          correct: true
        },

        {
          answerId: 2,
          answer: '1995',
          colour: 'blue',
          correct: false
        },

      ]
    };

    const questionSmall = {
      questionId: 1,
      question: 'What year did Lebron James play',
      duration: 3,
      points: 0,
      answers: [
        {
          answerId: 1,
          answer: '2000',
          colour: 'red',
          correct: true
        },

        {
          answerId: 2,
          answer: '1995',
          colour: 'blue',
          correct: false
        },

      ]
    };

    const createQuizRes6 = requestCreateQuizQuestion(firstQuizUser1.quizId, user1SessionToken, questionSmall);
    expect(createQuizRes6.statusCode).toStrictEqual(400);
    expect(createQuizRes6.body).toStrictEqual({ error: expect.any(String) });

    const createQuizRes7 = requestCreateQuizQuestion(firstQuizUser1.quizId, user1SessionToken, questionGreater);
    expect(createQuizRes7.statusCode).toStrictEqual(400);
    expect(createQuizRes7.body).toStrictEqual({ error: expect.any(String) });
  });

  test('The length of any answer is shorter than 1 character long, or longer than 30 characters long', () => {
    const questionAnsLen = {
      questionId: 1,
      question: 'What year did Lebron James play',
      duration: 3,
      points: 5,
      answers: [
        {
          answerId: 1,
          answer: '',
          colour: 'red',
          correct: true
        },

        {
          answerId: 2,
          answer: '000000000000000000000000000000000000000000000',
          colour: 'blue',
          correct: false
        },

      ]
    };
    const createQuizRes8 = requestCreateQuizQuestion(firstQuizUser1.quizId, user1SessionToken, questionAnsLen);
    expect(createQuizRes8.statusCode).toStrictEqual(400);
    expect(createQuizRes8.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Any answer strings are duplicates of one another (within the same question)', () => {
    const questionDupe = {
      questionId: 1,
      question: 'What year did Lebron James play',
      duration: 3,
      points: 5,
      answers: [
        {
          answerId: 1,
          answer: '2000',
          colour: 'red',
          correct: true
        },

        {
          answerId: 2,
          answer: '2000',
          colour: 'red',
          correct: false
        },

      ]
    };
    const createQuizRes9 = requestCreateQuizQuestion(firstQuizUser1.quizId, user1SessionToken, questionDupe);
    expect(createQuizRes9.statusCode).toStrictEqual(400);
    expect(createQuizRes9.body).toStrictEqual({ error: expect.any(String) });
  });

  test('There are no correct answers)', () => {
    const questionDupe = {
      questionId: 1,
      question: 'What year did Lebron James play',
      duration: 3,
      points: 5,
      answers: [
        {
          answerId: 1,
          answer: '1999',
          colour: 'red',
          correct: false
        },

        {
          answerId: 2,
          answer: '5000',
          colour: 'red',
          correct: false
        },

      ]
    };
    const createQuizRes10 = requestCreateQuizQuestion(firstQuizUser1.quizId, user1SessionToken, questionDupe);
    expect(createQuizRes10.statusCode).toStrictEqual(400);
    expect(createQuizRes10.body).toStrictEqual({ error: expect.any(String) });
  });
});

describe('ERROR 401', () => {
  test('Token is empty or invalid (does not refer to valid logged in user session)', () => {
    const inValidToken = '-1';
    const emptyToken = '';

    const questionValid = {
      questionId: 1,
      question: 'What year did Lebron James play',
      duration: 2,
      points: 8,
      answers: [
        {
          answerId: 1,
          answer: '2000',
          colour: 'red',
          correct: true
        },

        {
          answerId: 2,
          answer: '1995',
          colour: 'blue',
          correct: false
        },

      ]
    };
    const createQuizRes11 = requestCreateQuizQuestion(firstQuizUser1.quizId, inValidToken, questionValid);
    expect(createQuizRes11.statusCode).toStrictEqual(401);
    expect(createQuizRes11.body).toStrictEqual({ error: expect.any(String) });

    const createQuizRes12 = requestCreateQuizQuestion(firstQuizUser1.quizId, emptyToken, questionValid);
    expect(createQuizRes12.statusCode).toStrictEqual(401);
    expect(createQuizRes12.body).toStrictEqual({ error: expect.any(String) });
  });
});

describe('ERROR 403', () => {
  test('Valid token is provided, but either the quiz ID is invalid, or the user does not own the quiz', () => {
    const inValidQuizId = -1;

    const questionValid = {
      questionId: 1,
      question: 'What year did Lebron James play',
      duration: 2,
      points: 8,
      answers: [
        {
          answerId: 1,
          answer: '2000',
          colour: 'red',
          correct: true
        },

        {
          answerId: 2,
          answer: '1995',
          colour: 'blue',
          correct: false
        },

      ]
    };
    const createQuizRes13 = requestCreateQuizQuestion(firstQuizUser2.quizId, user1SessionToken, questionValid);
    expect(createQuizRes13.statusCode).toStrictEqual(403);
    expect(createQuizRes13.body).toStrictEqual({ error: expect.any(String) });

    const createQuizRes14 = requestCreateQuizQuestion(inValidQuizId, user1SessionToken, questionValid);
    expect(createQuizRes14.statusCode).toStrictEqual(403);
    expect(createQuizRes14.body).toStrictEqual({ error: expect.any(String) });
  });
});

describe('Correct Testing', () => {
  test('Creating 1 Question for user', () => {
    const questionValid1 = {
      questionId: 1,
      question: 'What year did Lebron James play',
      duration: 2,
      points: 8,
      answers: [
        {
          answerId: 1,
          answer: '2000',
          colour: 'red',
          correct: true
        },

        {
          answerId: 2,
          answer: '1995',
          colour: 'blue',
          correct: false
        },

      ]
    };
    const createQuizRes14 = requestCreateQuizQuestion(firstQuizUser1.quizId, user1SessionToken, questionValid1);
    expect(createQuizRes14.statusCode).toStrictEqual(200);

    expect(createQuizRes14.body.questionId).toStrictEqual(expect.any(Number));

    const quizShowres2 = requestGetQuizInfo(firstQuizUser1.quizId, user1SessionToken);

    expect(quizShowres2.body).toMatchObject({
      quizId: firstQuizUser1.quizId,
      name: 'Bball',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      numQuestions: 1,
      description: '10 questions on Basketball Teams',
      questions: expect.arrayContaining([
        expect.objectContaining({
          questionId: expect.any(Number),
          duration: expect.any(Number),
          points: 8,
          question: 'What year did Lebron James play',
          answers: expect.arrayContaining([
            expect.objectContaining({
              answerId: expect.any(Number),
              answer: expect.any(String),
              colour: expect.stringMatching(/red|blue|green|yellow|purple|brown|orange/), // Example for hex color code validation
              correct: expect.any(Boolean),
            }),
          ]),
        }),
      ]),
      duration: 2,
    });
  });

  test('Creating 2 Questionw for user', () => {
    const questionValid2 = {
      questionId: 1,
      question: 'What year did Lebron James play',
      duration: 2,
      points: 8,
      answers: [
        {
          answerId: 1,
          answer: '2000',
          colour: 'red',
          correct: true
        },

        {
          answerId: 2,
          answer: '1995',
          colour: 'blue',
          correct: false
        },

      ]
    };

    const questionValid3 = {
      questionId: 2,
      question: 'What year did Kobe Play',
      duration: 2,
      points: 4,
      answers: [
        {
          answerId: 1,
          answer: '2001',
          colour: 'red',
          correct: true
        },

        {
          answerId: 2,
          answer: '2008',
          colour: 'blue',
          correct: false
        },

      ]
    };
    const createQuizRes14 = requestCreateQuizQuestion(firstQuizUser1.quizId, user1SessionToken, questionValid2);
    expect(createQuizRes14.statusCode).toStrictEqual(200);

    expect(createQuizRes14.body.questionId).toStrictEqual(expect.any(Number));

    const createQuizRes15 = requestCreateQuizQuestion(firstQuizUser1.quizId, user1SessionToken, questionValid3);
    expect(createQuizRes15.statusCode).toStrictEqual(200);
    expect(createQuizRes15.body.questionId).toStrictEqual(expect.any(Number));

    const quizShowres3 = requestGetQuizInfo(firstQuizUser1.quizId, user1SessionToken);

    expect(quizShowres3.body).toMatchObject({
      quizId: firstQuizUser1.quizId,
      name: 'Bball',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      numQuestions: 2,
      description: '10 questions on Basketball Teams',
      questions: expect.arrayContaining([
        expect.objectContaining({
          questionId: expect.any(Number),
          duration: expect.any(Number),
          points: 8,
          question: 'What year did Lebron James play',
          answers: expect.arrayContaining([
            expect.objectContaining({
              answerId: expect.any(Number),
              answer: expect.any(String),
              colour: expect.stringMatching(/red|blue|green|yellow|purple|brown|orange/), // Example for hex color code validation
              correct: expect.any(Boolean),
            }),
          ]),
        }

        ),
      ]),
      duration: 4,
    });
  });
});
