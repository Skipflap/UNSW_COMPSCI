// import request from 'sync-request-curl';
// import { port, url } from '../src/config.json';
import HTTPError from 'http-errors';
import {
  requestClear,
  requestAuthRegister,
  adminQuizDuplicate,
  requestQuizCreateV2,
  requestGetQuizInfoV2,
  requestCreateQuizQuestionV2
} from './wrappers';

let token1: string;
let quizId1: number;
let questionId1: number;

beforeEach(() => {
  requestClear();

  token1 = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith').token;
  quizId1 = requestQuizCreateV2(token1, 'my quiz', 'the testing quiz').quizId;
  questionId1 = requestCreateQuizQuestionV2(
    token1,
    quizId1,
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
});

describe('Errors', () => {
  test('Error 400 - invalid questionID', () => {
    expect(() => adminQuizDuplicate(token1, quizId1, questionId1 + 1)).toThrow(HTTPError[400]);
  });
  test('Error 401 - invalid token', () => {
    expect(() => adminQuizDuplicate(token1 + 1, quizId1, questionId1)).toThrow(HTTPError[401]);
  });
  test('Error 401 - empty token', () => {
    expect(() => adminQuizDuplicate('', quizId1, questionId1 + 1)).toThrow(HTTPError[401]);
  });
  test('Error 403 - invalid quizId', () => {
    expect(() => adminQuizDuplicate(token1, quizId1 + 1, questionId1)).toThrow(HTTPError[403]);
  });
  test('Error 403 - user does not own this quiz', () => {
    const token2: string = requestAuthRegister('beepboopmeupscotty@gmail.com', 'beepboop123', 'beep', 'boop').token;
    const quizId2: number = requestQuizCreateV2(token2, 'beep quiz', 'beep boop i am robot scotty').quizId;
    const questionId2: number = requestCreateQuizQuestionV2(
      token2,
      quizId2,
      {
        question: 'hello world',
        duration: 10,
        points: 10,
        answers: [
          {
            answer: 'hi',
            correct: false
          },
          {
            answer: 'goodbye',
            correct: true
          }
        ],
        thumbnailUrl: 'http://test.com/image.jpg'
      }
    ).questionId;
    expect(() => adminQuizDuplicate(token1, quizId2, questionId2)).toThrow(HTTPError[403]);
  });
});

describe('Successful Run 200', () => {
  test('success', () => {
    expect(() => adminQuizDuplicate(token1, quizId1, questionId1)).not.toThrow();
    expect(requestGetQuizInfoV2(quizId1, token1)).toStrictEqual({
      quizId: quizId1,
      name: 'my quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'the testing quiz',
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
              answer: 'Samuel Harland',
              colour: expect.any(String),
              correct: false
            }
          ]
        },
        {
          questionId: expect.any(Number),
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
        }
      ],
      duration: expect.any(Number),
      thumbnailUrl: '',
    });
  });
});
