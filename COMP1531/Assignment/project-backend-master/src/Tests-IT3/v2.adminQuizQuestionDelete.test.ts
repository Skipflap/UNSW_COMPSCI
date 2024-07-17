import { requestAuthRegister, requestCreateQuizQuestionV2, requestClear, requestQuizQuestionDeleteV2, requestGetQuizInfoV2, requestQuizCreateV2, requestSessionStart } from './wrappers';
import HTTPError from 'http-errors';

let testToken: string, quizId: number, questionId: number;
beforeEach(() => {
  requestClear();
  const test1 = requestAuthRegister('validtest@gmail.com', 'valid123', 'validfirst', 'validlast');
  if ('token' in test1) {
    testToken = test1.token;
  }
  const test2 = requestQuizCreateV2(testToken, 'Test Quiz', 'Description test for quiz.');
  if ('quizId' in test2) {
    quizId = test2.quizId;
  }
  const test3 = requestCreateQuizQuestionV2(
    testToken,
    quizId,
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
      ],
      thumbnailUrl: 'http://test.com/image.jpg'
    }
  );
  if ('questionId' in test3) {
    questionId = test3.questionId;
  }
}, 1000);

describe('Error Tests', () => {
  test('Error: Token is invalid', () => {
    const invalidToken1 = testToken + 'impossible token';
    const invalidToken2 = '';
    expect(() => requestQuizQuestionDeleteV2(quizId, questionId, invalidToken1)).toThrow(HTTPError[401]);
    expect(() => requestQuizQuestionDeleteV2(quizId, questionId, invalidToken2)).toThrow(HTTPError[401]);
  });

  test('Error: quiz ID is invalid', () => {
    const invalidquizid = quizId + 1;
    expect(() => requestQuizQuestionDeleteV2(invalidquizid, questionId, testToken)).toThrow(HTTPError[403]);
  });

  test('Error: user does not own the quiz', () => {
    const testToken2 = requestAuthRegister('validextra@gmail.com', 'valid123', 'validfirstch', 'validlastch').token;
    expect(() => requestQuizQuestionDeleteV2(quizId, questionId, testToken2)).toThrow(HTTPError[403]);
  });

  test('Error: Question Id does not refer to a valid question within this quiz', () => {
    const invalidquestionid = questionId + 1;
    expect(() => requestQuizQuestionDeleteV2(quizId, invalidquestionid, testToken)).toThrow(HTTPError[400]);
  });

  test('Error: Any session for this quiz is not in END state', () => {
    requestSessionStart(testToken, 3, quizId);
    expect(() => requestQuizQuestionDeleteV2(quizId, questionId, testToken)).toThrow(HTTPError[400]);
  });
});

describe('Correct Tests', () => {
  test('Correct return type', () => {
    expect(requestQuizQuestionDeleteV2(quizId, questionId, testToken)).toStrictEqual({ });
  });

  test('Correct behaviour and side effects: question is deleted from quiz view', () => {
    const questionId2 = requestCreateQuizQuestionV2(
      testToken,
      quizId,
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
        ],
        thumbnailUrl: 'http://test.com/image.jpg'
      }
    ).questionId;
    requestQuizQuestionDeleteV2(quizId, questionId, testToken);
    const quizDelete = requestGetQuizInfoV2(quizId, testToken);
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
          thumbnailUrl: 'http://test.com/image.jpg',
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
      duration: 10,
      thumbnailUrl: '',
    });
  });
});
