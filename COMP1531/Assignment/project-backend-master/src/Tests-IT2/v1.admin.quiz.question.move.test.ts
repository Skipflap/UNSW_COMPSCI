import { requestAuthRegister, requestQuizDetails, requestQuizCreate, requestQuizQuestionCreate, requestClear, requestQuizQuestionMove } from './wrappers';
import { Questions } from '../interface';

let testToken: string, quizId: number, questionId1: number, questionId2: number, questionId3: number, question1details: Questions, question2details: Questions, question3details: Questions;

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestClear();
  testToken = requestAuthRegister('validtest@gmail.com', 'valid123', 'validfirst', 'validlast').bodyObject.token;

  quizId = requestQuizCreate(testToken, 'Test Quiz', 'Description test for quiz.').bodyObject.quizId;

  questionId1 = requestQuizQuestionCreate(
    quizId,
    testToken,
    {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Samuel Harland',
          correct: false
        }
      ]
    }
  ).bodyObject.questionId;

  questionId2 = requestQuizQuestionCreate(
    quizId,
    testToken,
    {
      question: 'Are you liking this iteration?',
      duration: 10,
      points: 7,
      answers: [
        {
          answer: 'No',
          correct: true
        },
        {
          answer: 'Yes',
          correct: false
        }
      ]
    }
  ).bodyObject.questionId;

  questionId3 = requestQuizQuestionCreate(
    quizId,
    testToken,
    {
      question: 'Are you a master coder?',
      duration: 15,
      points: 2,
      answers: [
        {
          answer: 'No',
          correct: true
        },
        {
          answer: 'Yes',
          correct: false
        }
      ]
    }
  ).bodyObject.questionId;

  question1details = {
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
        answer: 'Samuel Harland',
        colour: expect.any(String),
        correct: false
      }
    ]
  };

  question2details = {
    questionId: questionId2,
    question: 'Are you liking this iteration?',
    duration: 10,
    points: 7,
    answers: [
      {
        answerId: expect.any(Number),
        answer: 'No',
        colour: expect.any(String),
        correct: true
      },
      {
        answerId: expect.any(Number),
        answer: 'Yes',
        colour: expect.any(String),
        correct: false
      }
    ]
  };

  question3details = {
    questionId: questionId3,
    question: 'Are you a master coder?',
    duration: 15,
    points: 2,
    answers: [
      {
        answerId: expect.any(Number),
        answer: 'No',
        colour: expect.any(String),
        correct: true
      },
      {
        answerId: expect.any(Number),
        answer: 'Yes',
        colour: expect.any(String),
        correct: false
      }
    ]
  };
}, 1000);

describe('Error Tests', () => {
  test('Error: Token is invalid', () => {
    const invalidToken1 = testToken + 'impossible token';
    const invalidToken2 = '';
    const responseTest1 = requestQuizQuestionMove(quizId, questionId2, invalidToken1, 1);
    const responseTest2 = requestQuizQuestionMove(quizId, questionId2, invalidToken2, 1);
    expect(responseTest1.status).toStrictEqual(401);
    expect(responseTest1.bodyObject).toStrictEqual(ERROR);
    expect(responseTest2.status).toStrictEqual(401);
    expect(responseTest2.bodyObject).toStrictEqual(ERROR);
  });

  test('Error: quiz ID is invalid', () => {
    const invalidquizid = -1000;
    const responseTest = requestQuizQuestionMove(invalidquizid, questionId2, testToken, 1);
    expect(responseTest.status).toStrictEqual(403);
    expect(responseTest.bodyObject).toStrictEqual(ERROR);
  });

  test('Error: user does not own the quiz', () => {
    const testToken2 = requestAuthRegister('validextra@gmail.com', 'valid123', 'validfirstch', 'validlastch').bodyObject.token;
    const responseTest = requestQuizQuestionMove(quizId, questionId2, testToken2, 1);
    expect(responseTest.status).toStrictEqual(403);
    expect(responseTest.bodyObject).toStrictEqual(ERROR);
  });

  test('Error: Question Id does not refer to a valid question within this quiz', () => {
    const invalidquestionid = -1000;
    const responseTest = requestQuizQuestionMove(quizId, invalidquestionid, testToken, 1);
    expect(responseTest.status).toStrictEqual(400);
    expect(responseTest.bodyObject).toStrictEqual(ERROR);
  });

  test.each([
    { test: 'new position is less than 0', newPosition: -1 },
    { test: 'new position is greater than question length', newPosition: 10 },
    { test: 'new position is in the current position', newPosition: 0 }
  ])('Error: $test', ({ newPosition }) => {
    const responseTest = requestQuizQuestionMove(quizId, questionId1, testToken, newPosition);
    expect(responseTest.status).toStrictEqual(400);
    expect(responseTest.bodyObject).toStrictEqual(ERROR);
  });
});

describe('Correct Tests and behaviour', () => {
  test('Correct return type: Move to start', () => {
    const timeEdited = Math.floor(Date.now() / 1000);
    const responseTest = requestQuizQuestionMove(quizId, questionId2, testToken, 0);
    expect(responseTest.status).toStrictEqual(200);
    expect(responseTest.bodyObject).toStrictEqual({ });
    const quizDetail = requestQuizDetails(quizId, testToken).bodyObject;
    expect(requestQuizDetails(quizId, testToken).bodyObject).toStrictEqual({
      quizId: quizId,
      name: 'Test Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Description test for quiz.',
      numQuestions: 3,
      questions: [
        question2details, question1details, question3details
      ],
      duration: 29
    });
    expect(quizDetail.timeLastEdited).toBeGreaterThanOrEqual(timeEdited);
    expect(quizDetail.timeLastEdited).toBeLessThanOrEqual(timeEdited + 2);
  });

  test('Correct return type: Move to middle', () => {
    const timeEdited = Math.floor(Date.now() / 1000);
    const responseTest = requestQuizQuestionMove(quizId, questionId3, testToken, 1);
    expect(responseTest.status).toStrictEqual(200);
    expect(responseTest.bodyObject).toStrictEqual({ });
    const quizDetail = requestQuizDetails(quizId, testToken).bodyObject;
    expect(requestQuizDetails(quizId, testToken).bodyObject).toStrictEqual({
      quizId: quizId,
      name: 'Test Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Description test for quiz.',
      numQuestions: 3,
      questions: [
        question1details, question3details, question2details
      ],
      duration: 29
    });
    expect(quizDetail.timeLastEdited).toBeGreaterThanOrEqual(timeEdited);
    expect(quizDetail.timeLastEdited).toBeLessThanOrEqual(timeEdited + 2);
  });

  test('Correct return type: Move to end', () => {
    const timeEdited = Math.floor(Date.now() / 1000);
    const responseTest = requestQuizQuestionMove(quizId, questionId1, testToken, 2);
    expect(responseTest.status).toStrictEqual(200);
    expect(responseTest.bodyObject).toStrictEqual({ });
    const quizDetail = requestQuizDetails(quizId, testToken).bodyObject;
    expect(requestQuizDetails(quizId, testToken).bodyObject).toStrictEqual({
      quizId: quizId,
      name: 'Test Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Description test for quiz.',
      numQuestions: 3,
      questions: [
        question2details, question3details, question1details
      ],
      duration: 29
    });
    expect(quizDetail.timeLastEdited).toBeGreaterThanOrEqual(timeEdited);
    expect(quizDetail.timeLastEdited).toBeLessThanOrEqual(timeEdited + 2);
  });
});
