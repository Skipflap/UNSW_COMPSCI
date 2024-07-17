import HTTPError from 'http-errors';
import { requestUpdateQuestionV2, requestClear, requestAuthRegister, requestQuizCreateV2, requestCreateQuizQuestionV2, requestGetQuizInfoV2 } from './wrappers';
// Tests
let token1 : string, quizId1 : number, questionId1 : number;
let token2 : string, quizId2 : number, questionId2 : number;

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
  ],
  thumbnailUrl: 'http://test.com/image.jpg',
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
  ],
  thumbnailUrl: 'http://test.com/image.jpg',
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
  ],
  thumbnailUrl: 'http://test.com/image.jpg',
};
beforeEach(() => {
  requestClear();

  token1 = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith').token;
  quizId1 = requestQuizCreateV2(token1, 'My Quiz Name', 'A description of my quiz').quizId;
  questionId1 = requestCreateQuizQuestionV2(token1, quizId1, validQuestion).questionId;

  token2 = requestAuthRegister('berb.gray@unsw.edu.au', 'berbgray183', 'Berb', 'Gray').token;
  quizId2 = requestQuizCreateV2(token2, 'That Quiz Name', 'Yes another description').quizId;
  questionId2 = requestCreateQuizQuestionV2(token2, quizId2, validQuestion).questionId;
});

describe('Errors', () => {
  describe('Error 400', () => {
    test('Question Id is not valid in quiz', () => {
      expect(() => requestUpdateQuestionV2(token1, quizId1, questionId2, updatedQuestion)).toThrow(HTTPError[400]);
    });
    test('sum of the question durations exceeds 3 minutes', () => {
      expect(() => requestUpdateQuestionV2(token1, quizId1, questionId1, longQuestion)).toThrow(HTTPError[400]);
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
    const validUrl = 'http://test.com/image.jpg';
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
        answers: answers,
        thumbnailUrl: validUrl
      };
      expect(() => requestUpdateQuestionV2(token1, quizId1, questionId1, testQuestion)).toThrow(HTTPError[400]);
    });

    test.each([
      { test: 'thumbnailUrl is an empty string', thumbnailUrl: '' },
      { test: 'thumbnailUrl does not end with jpg, jpeg, png', thumbnailUrl: 'http://test.com/image.md' },
      { test: 'thumbnailUrl does not begin with http:// or https://', thumbnailUrl: 'www://test.com/image.jpg' },
    ])('Error: $test', ({ thumbnailUrl }) => {
      const testQuestion = {
        question: validQName,
        duration: 4,
        points: 5,
        answers: validAnswer,
        thumbnailUrl: thumbnailUrl
      };
      expect(() => requestUpdateQuestionV2(token1, quizId1, questionId1, testQuestion)).toThrow(HTTPError[400]);
    });
  });

  test('Error 401 - Token is empty', () => {
    const emptyToken = '';

    expect(() => requestUpdateQuestionV2(emptyToken, quizId1, questionId1, updatedQuestion)).toThrow(HTTPError[401]);
  });
  test('Error 401 - Token is invalid', () => {
    const invalidToken = token1 + '99999999';
    expect(() => requestUpdateQuestionV2(invalidToken, quizId1, questionId1, updatedQuestion)).toThrow(HTTPError[401]);
  });

  test('Error 403 - Valid token, but quizId invalid', () => {
    const invalidQuizId = quizId1 + 1;
    expect(() => requestUpdateQuestionV2(token1, invalidQuizId, questionId1, updatedQuestion)).toThrow(HTTPError[403]);
  });
  test('Error 403 - Valid token, but user doesnt own quiz', () => {
    expect(() => requestUpdateQuestionV2(token1, quizId2, questionId1, updatedQuestion)).toThrow(HTTPError[403]);
  });
});

test('Successful run 200', () => {
  expect(requestUpdateQuestionV2(token1, quizId1, questionId1, updatedQuestion)).toStrictEqual({});

  const quizDetails = requestGetQuizInfoV2(quizId1, token1);
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
            answer: 'Queen Elizabeth',
            colour: expect.any(String),
            correct: false
          }
        ]
      }
    ],
    duration: 4,
    thumbnailUrl: ''
  });
  expect(quizDetails.timeLastEdited).toBeGreaterThanOrEqual(quizDetails.timeCreated);
});
