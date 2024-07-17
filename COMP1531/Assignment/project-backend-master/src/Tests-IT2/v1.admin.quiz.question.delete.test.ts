import { requestAuthRegister, requestQuizCreate, requestQuizQuestionCreate, requestClear, requestQuizQuestionDelete, requestQuizDetails } from './wrappers';
const ERROR = { error: expect.any(String) };

let testToken: string, quizId: number, questionId: number;
beforeEach(() => {
  requestClear();
  const test1 = requestAuthRegister('validtest@gmail.com', 'valid123', 'validfirst', 'validlast').bodyObject;
  if ('token' in test1) {
    testToken = test1.token;
  }
  const test2 = requestQuizCreate(testToken, 'Test Quiz', 'Description test for quiz.').bodyObject;
  if ('quizId' in test2) {
    quizId = test2.quizId;
  }
  const test3 = requestQuizQuestionCreate(
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
  ).bodyObject;
  if ('questionId' in test3) {
    questionId = test3.questionId;
  }
}, 1000);

describe('Error Tests', () => {
  test('Error: Token is invalid', () => {
    const invalidToken1 = 'impossible token';
    const invalidToken2 = '';
    const responseTest1 = requestQuizQuestionDelete(quizId, questionId, invalidToken1);
    const responseTest2 = requestQuizQuestionDelete(quizId, questionId, invalidToken2);
    expect(responseTest1.status).toStrictEqual(401);
    expect(responseTest1.bodyObject).toStrictEqual(ERROR);
    expect(responseTest2.status).toStrictEqual(401);
    expect(responseTest2.bodyObject).toStrictEqual(ERROR);
  });

  test('Error: quiz ID is invalid', () => {
    const invalidquizid = -1000;
    const responseTest = requestQuizQuestionDelete(invalidquizid, questionId, testToken);
    expect(responseTest.status).toStrictEqual(403);
    expect(responseTest.bodyObject).toStrictEqual(ERROR);
  });

  test('Error: user does not own the quiz', () => {
    const testToken2 = requestAuthRegister('validextra@gmail.com', 'valid123', 'validfirstch', 'validlastch').bodyObject.token;
    const responseTest = requestQuizQuestionDelete(quizId, questionId, testToken2);
    expect(responseTest.status).toStrictEqual(403);
    expect(responseTest.bodyObject).toStrictEqual(ERROR);
  });

  test('Error: Question Id does not refer to a valid question within this quiz', () => {
    const invalidquestionid = -1000;
    const responseTest = requestQuizQuestionDelete(quizId, invalidquestionid, testToken);
    expect(responseTest.status).toStrictEqual(400);
    expect(responseTest.bodyObject).toStrictEqual(ERROR);
  });
});

describe('Correct Tests', () => {
  test('Correct return type', () => {
    const responseTest = requestQuizQuestionDelete(quizId, questionId, testToken);
    expect(responseTest.status).toStrictEqual(200);
    expect(responseTest.bodyObject).toStrictEqual({ });
  });

  test('Correct behaviour and side effects: question is deleted from quiz view', () => {
    const questionId2 = requestQuizQuestionCreate(
      quizId,
      testToken,
      {
        question: 'Do you like this iteration?',
        duration: 10,
        points: 10,
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
    requestQuizQuestionDelete(quizId, questionId, testToken);
    const quizDelete = requestQuizDetails(quizId, testToken).bodyObject;
    expect(quizDelete).toStrictEqual({
      quizId: quizId,
      name: 'Test Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Description test for quiz.',
      numQuestions: 1,
      questions: [
        {
          questionId: questionId2,
          question: 'Do you like this iteration?',
          duration: 10,
          points: 10,
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
            },
          ]
        }
      ],
      duration: 10
    });
  });
});
