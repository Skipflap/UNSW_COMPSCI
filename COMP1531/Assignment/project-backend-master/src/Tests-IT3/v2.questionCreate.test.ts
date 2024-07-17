import HTTPError from 'http-errors';
import { requestClear, requestAuthRegister, requestGetQuizInfoV2, requestQuizCreateV2, requestCreateQuizQuestionV2 } from './wrappers';

let token1, token2, firstQuizUser1, firstQuizUser2;

beforeEach(() => {
  requestClear();

  token1 = requestAuthRegister('lebron724@gmail.com', 'ball1234', 'Lebron', 'James').token;
  firstQuizUser1 = requestQuizCreateV2(token1, 'Bball', '10 questions on Basketball Teams').quizId;

  // user 2 has 1 quiz.
  token2 = requestAuthRegister('messi448@gmail.com', 'soccer2312', 'Leo', 'Messi').token;
  firstQuizUser2 = requestQuizCreateV2(token2, 'Soccer', '5 questions of Soccer teams').quizId;
});

describe('ERROR 400', () => {
  test.each([
    ['Question string is less than 5 characters', 'TorF', { answer: '2000', correct: true }, { answer: '1995', correct: false }],
    ['Question string is greater than 50 characters', 'What year did Lebron James start playing basketball professionally', { answer: '2000', correct: true }, { answer: '1995', correct: false }]
  ])('%s', (description, question, answer1, answer2) => {
    const questionDetails = {
      question,
      duration: 5,
      points: 10,
      answers: [answer1, answer2],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };
    expect(() => requestCreateQuizQuestionV2(token1, firstQuizUser1, questionDetails)).toThrow(HTTPError[400]);
  });

  test.each([
    ['The question has less than 2 answers', [{ answer: '2000', correct: true }]],
    ['The question has more than 6 answers', new Array(7).fill({ answer: '2000', correct: false })],
  ])('%s', (description, answers) => {
    const questionDetails = {
      question: 'What year did Lebron James play',
      duration: 5,
      points: 10,
      answers: answers,
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };
    expect(() => requestCreateQuizQuestionV2(token1, firstQuizUser1, questionDetails)).toThrow(HTTPError[400]);
  });

  test.each([
    ['The question duration is not a positive number', -1],
    ['The sum of the question durations in the quiz exceeds 3 minutes', 181],
  ])('%s', (description, duration) => {
    const questionDetails = {
      question: 'What year did Lebron James play',
      duration: duration,
      points: 10,
      answers: [
        { answer: '2000', correct: true },
        { answer: '1995', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };
    expect(() => requestCreateQuizQuestionV2(token1, firstQuizUser1, questionDetails)).toThrow(HTTPError[400]);
  });

  test.each([
    ['The points awarded for the question are less than 1', 0],
    ['The points awarded for the question are greater than 10', 20],
  ])('%s', (description, points) => {
    const questionDetails = {
      question: 'What year did Lebron James play',
      duration: 3,
      points: points,
      answers: [
        { answer: '2000', correct: true },
        { answer: '1995', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };
    expect(() => requestCreateQuizQuestionV2(token1, firstQuizUser1, questionDetails)).toThrow(HTTPError[400]);
  });

  test.each([
    ['The length of any answer is shorter than 1 character', '', '000000000000000000000000000000000000000000000'],
    ['Any answer strings are duplicates of one another (within the same question)', '2000', '2000'],
    ['There are no correct answers', '1999', '5000', false]
  ])('%s', (description, answer1, answer2, correct = true) => {
    const questionDetails = {
      question: 'What year did Lebron James play',
      duration: 3,
      points: 5,
      answers: [
        { answer: answer1, correct: correct },
        { answer: answer2, correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };
    expect(() => requestCreateQuizQuestionV2(token1, firstQuizUser1, questionDetails)).toThrow(HTTPError[400]);
  });

  test.each([
    ['The thumbnailUrl is an empty string', '', 'answer2', true, 400],
    ['The thumbnailUrl does not end with one of the following filetypes (case insensitive): jpg, jpeg, png', 'http://example.com/image.bmp', 'answer2', true, 400],
    ['The thumbnailUrl does not begin with http or https', 'example.com/image.jpg', 'answer2', true, 400]
  ])('%s', (description, thumbnailUrl, answer2, correct, expectedError) => {
    const questionDetails = {
      question: 'What year did LeBron James start playing?',
      duration: 3,
      points: 5,
      answers: [
        { answer: '2003', correct: correct },
        { answer: answer2, correct: false }
      ],
      thumbnailUrl: thumbnailUrl,
    };

    expect(() => requestCreateQuizQuestionV2(token1, firstQuizUser1, questionDetails)).toThrowError(HTTPError[400]);
  });
});

describe('ERROR 401', () => {
  test('Token is empty or invalid (does not refer to valid logged in user session)', () => {
    const inValidToken = '-1';
    const emptyToken = '';

    const questionValid = {
      question: 'What year did Lebron James play',
      duration: 2,
      points: 8,
      answers: [
        {
          answer: '2000',
          correct: true
        },

        {
          answer: '1995',
          correct: false
        },
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };

    expect(() => requestCreateQuizQuestionV2(inValidToken, firstQuizUser1, questionValid)).toThrow(HTTPError[401]);
    expect(() => requestCreateQuizQuestionV2(emptyToken, firstQuizUser1, questionValid)).toThrow(HTTPError[401]);
  });
});

describe('ERROR 403', () => {
  test('Valid token is provided, but either the quiz ID is invalid, or the user does not own the quiz', () => {
    const inValidQuizId = -1;

    const questionValid = {
      question: 'What year did Lebron James play',
      duration: 2,
      points: 8,
      answers: [
        {
          answer: '2000',
          correct: true
        },

        {
          answer: '1995',
          correct: false
        },
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };

    expect(() => requestCreateQuizQuestionV2(token1, firstQuizUser2, questionValid)).toThrow(HTTPError[403]);
    expect(() => requestCreateQuizQuestionV2(token1, inValidQuizId, questionValid)).toThrow(HTTPError[403]);
  });
});

describe('Correct Testing', () => {
  test('Creating 1 Question for user', () => {
    const questionValid1 = {
      question: 'What year did Lebron James play',
      duration: 2,
      points: 8,
      answers: [
        {
          answer: '2000',
          correct: true
        },

        {
          answer: '1995',
          correct: false
        },

      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };

    expect(requestCreateQuizQuestionV2(token1, firstQuizUser1, questionValid1).questionId).toStrictEqual(expect.any(Number));

    expect(requestGetQuizInfoV2(firstQuizUser1, token1)).toMatchObject({
      quizId: firstQuizUser1,
      name: 'Bball',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: '10 questions on Basketball Teams',
      numQuestions: 1,
      questions: expect.arrayContaining([
        expect.objectContaining({
          questionId: expect.any(Number),
          question: 'What year did Lebron James play',
          duration: expect.any(Number),
          thumbnailUrl: 'http://google.com/some/image/path.jpg',
          points: 8,
          answers: expect.arrayContaining([
            expect.objectContaining({
              answerId: expect.any(Number),
              answer: expect.any(String),
              colour: expect.stringMatching(/red|blue|green|yellow|purple|brown|orange/),
              correct: expect.any(Boolean),
            }),
          ]),
        }),
      ]),
      duration: 2,
      thumbnailUrl: '',
    });
  });

  test('Creating 2 Question for user', () => {
    const questionValid2 = {
      question: 'What year did Lebron James play',
      duration: 2,
      points: 8,
      answers: [
        {
          answer: '2000',
          correct: true
        },

        {
          answer: '1995',
          correct: false
        },

      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };

    const questionValid3 = {
      question: 'What year did Kobe Play',
      duration: 2,
      points: 4,
      answers: [
        {
          answer: '2001',
          correct: true
        },

        {
          answer: '2008',
          correct: false
        },

      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };

    expect(requestCreateQuizQuestionV2(token1, firstQuizUser1, questionValid2).questionId).toStrictEqual(expect.any(Number));
    expect(requestCreateQuizQuestionV2(token1, firstQuizUser1, questionValid3).questionId).toStrictEqual(expect.any(Number));

    const quizShowres3 = requestGetQuizInfoV2(firstQuizUser1, token1);

    expect(quizShowres3).toMatchObject({
      quizId: firstQuizUser1,
      name: 'Bball',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: '10 questions on Basketball Teams',
      numQuestions: 2,
      questions: expect.arrayContaining([
        expect.objectContaining({
          questionId: expect.any(Number),
          question: 'What year did Lebron James play',
          duration: expect.any(Number),
          thumbnailUrl: 'http://google.com/some/image/path.jpg',
          points: 8,
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
      thumbnailUrl: '',
    });
  });
});
