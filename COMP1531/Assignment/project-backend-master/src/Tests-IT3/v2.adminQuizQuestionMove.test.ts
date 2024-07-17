import { requestAuthRegister, requestGetQuizInfoV2, requestQuizCreateV2, requestCreateQuizQuestionV2, requestClear, requestQuizQuestionMoveV2 } from './wrappers';
import { Questions } from '../interface';
import HTTPError from 'http-errors';

let testToken: string, quizId: number, questionId1: number, questionId2: number, questionId3: number, question1details: Questions, question2details: Questions, question3details: Questions;

beforeEach(() => {
  requestClear();
  testToken = requestAuthRegister('validtest@gmail.com', 'valid123', 'validfirst', 'validlast').token;
  quizId = requestQuizCreateV2(testToken, 'Test Quiz', 'Description test for quiz.').quizId;
  questionId1 = requestCreateQuizQuestionV2(
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
  ).questionId;

  questionId2 = requestCreateQuizQuestionV2(
    testToken,
    quizId,
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
      ],
      thumbnailUrl: 'http://test.com/image.jpg'
    }
  ).questionId;

  questionId3 = requestCreateQuizQuestionV2(
    testToken,
    quizId,
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
      ],
      thumbnailUrl: 'http://test.com/image.jpg'
    }
  ).questionId;

  question1details = {
    questionId: questionId1,
    question: 'Who is the Monarch of England?',
    duration: 4,
    thumbnailUrl: 'http://test.com/image.jpg',
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
    thumbnailUrl: 'http://test.com/image.jpg',
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
    thumbnailUrl: 'http://test.com/image.jpg',
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
    expect(() => requestQuizQuestionMoveV2(quizId, questionId2, invalidToken1, 1)).toThrow(HTTPError[401]);
    expect(() => requestQuizQuestionMoveV2(quizId, questionId2, invalidToken2, 1)).toThrow(HTTPError[401]);
  });

  test('Error: quiz ID is invalid', () => {
    const invalidquizid = quizId + 1;
    expect(() => requestQuizQuestionMoveV2(invalidquizid, questionId2, testToken, 1)).toThrow(HTTPError[403]);
  });

  test('Error: user does not own the quiz', () => {
    const testToken2 = requestAuthRegister('validextra@gmail.com', 'valid123', 'validfirstch', 'validlastch').token;
    expect(() => requestQuizQuestionMoveV2(quizId, questionId2, testToken2, 1)).toThrow(HTTPError[403]);
  });

  test('Error: Question Id does not refer to a valid question within this quiz', () => {
    requestClear();
    testToken = requestAuthRegister('validtest@gmail.com', 'valid123', 'validfirst', 'validlast').token;
    quizId = requestQuizCreateV2(testToken, 'Test Quiz', 'Description test for quiz.').quizId;

    questionId1 = requestCreateQuizQuestionV2(
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
    ).questionId;

    const invalidquestionid = questionId1 + 1;
    expect(() => requestQuizQuestionMoveV2(quizId, invalidquestionid, testToken, 1)).toThrow(HTTPError[400]);
  });

  test.each([
    { test: 'new position is less than 0', newPosition: -1 },
    { test: 'new position is greater than question length', newPosition: 10 },
    { test: 'new position is in the current position', newPosition: 0 }
  ])('Error: $test', ({ newPosition }) => {
    expect(() => requestQuizQuestionMoveV2(quizId, questionId1, testToken, newPosition)).toThrow(HTTPError[400]);
  });
});

describe('Correct Tests and behaviour', () => {
  test('Correct return type: Move to start', () => {
    const timeEdited = Math.floor(Date.now() / 1000);
    expect(requestQuizQuestionMoveV2(quizId, questionId2, testToken, 0)).toStrictEqual({ });
    const quizDetail = requestGetQuizInfoV2(quizId, testToken);
    expect(requestGetQuizInfoV2(quizId, testToken)).toStrictEqual({
      quizId: quizId,
      name: 'Test Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Description test for quiz.',
      numQuestions: 3,
      questions: [
        question2details, question1details, question3details
      ],
      duration: 29,
      thumbnailUrl: '',
    });
    expect(quizDetail.timeLastEdited).toBeGreaterThanOrEqual(timeEdited);
    expect(quizDetail.timeLastEdited).toBeLessThanOrEqual(timeEdited + 2);
  });

  test('Correct return type: Move to middle', () => {
    const timeEdited = Math.floor(Date.now() / 1000);
    expect(requestQuizQuestionMoveV2(quizId, questionId3, testToken, 1)).toStrictEqual({ });
    const quizDetail = requestGetQuizInfoV2(quizId, testToken);
    expect(quizDetail).toStrictEqual({
      quizId: quizId,
      name: 'Test Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Description test for quiz.',
      numQuestions: 3,
      questions: [
        question1details, question3details, question2details
      ],
      duration: 29,
      thumbnailUrl: ''
    });
    expect(quizDetail.timeLastEdited).toBeGreaterThanOrEqual(timeEdited);
    expect(quizDetail.timeLastEdited).toBeLessThanOrEqual(timeEdited + 2);
  });

  test('Correct return type: Move to end', () => {
    const timeEdited = Math.floor(Date.now() / 1000);
    expect(requestQuizQuestionMoveV2(quizId, questionId1, testToken, 2)).toStrictEqual({ });
    const quizDetail = requestGetQuizInfoV2(quizId, testToken);
    expect(quizDetail).toStrictEqual({
      quizId: quizId,
      name: 'Test Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Description test for quiz.',
      numQuestions: 3,
      questions: [
        question2details, question3details, question1details
      ],
      duration: 29,
      thumbnailUrl: ''
    });
    expect(quizDetail.timeLastEdited).toBeGreaterThanOrEqual(timeEdited);
    expect(quizDetail.timeLastEdited).toBeLessThanOrEqual(timeEdited + 2);
  });
});
