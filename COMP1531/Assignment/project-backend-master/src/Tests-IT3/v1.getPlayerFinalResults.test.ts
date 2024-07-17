import HTTPError from 'http-errors';
import {
  requestAuthRegister,
  requestQuizCreateV2,
  requestSessionStart,
  requestClear,
  requestSessionStateUpdate,
  requestGetQuizSessionStatus,
  requestCreateQuizQuestionV2,
  requestPlayerJoin,
  requestPlayerAnswer,
  requestGetPlayerFinalResults
} from './wrappers';

// Sleep function
function sleepSync(ms: number) {
  const startTime = new Date().getTime();
  while (new Date().getTime() - startTime < ms) {
    // zzzZZ - comment needed so eslint doesn't complain
  }
}

// Tests
let token1: string, quizId1: number, sessionId1: number;
let questionId1: number, questionId2: number;
let playerId1: number, playerId2: number, playerId3: number;
let q1AnswerId1: number, q1AnswerId2: number, q2AnswerId1: number, q2AnswerId2: number, q2AnswerId3: number, q2AnswerId4: number;
const validQuestion1 = {
  question: 'Favorite icecream flavor?',
  duration: 5,
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
  thumbnailUrl: 'http://google.com/some/image/path.jpg',
};
const validQuestion2 = {
  question: 'Favorite sport?',
  duration: 10,
  points: 10,
  answers: [
    {
      answer: 'Tennis',
      correct: true
    },
    {
      answer: 'BasketBall',
      correct: false
    },
    {
      answer: 'Baseball',
      correct: false
    },
    {
      answer: 'Netball',
      correct: true
    }
  ],
  thumbnailUrl: 'http://google.com/some/image/path.jpg',
};

beforeEach(() => {
  requestClear();

  token1 = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith').token;
  quizId1 = requestQuizCreateV2(token1, 'My Quiz Name', 'A description of my quiz').quizId;
  questionId1 = requestCreateQuizQuestionV2(token1, quizId1, validQuestion1).questionId;
  questionId2 = requestCreateQuizQuestionV2(token1, quizId1, validQuestion2).questionId;
  sessionId1 = requestSessionStart(token1, 0, quizId1).sessionId;

  playerId1 = requestPlayerJoin('Joe', sessionId1).playerId;
  playerId2 = requestPlayerJoin('Nosa', sessionId1).playerId;
  playerId3 = requestPlayerJoin('Rock', sessionId1).playerId;

  q1AnswerId1 = requestGetQuizSessionStatus(token1, quizId1, sessionId1).metadata.questions[0].answers[0].answerId;
  q1AnswerId2 = requestGetQuizSessionStatus(token1, quizId1, sessionId1).metadata.questions[0].answers[1].answerId;

  q2AnswerId1 = requestGetQuizSessionStatus(token1, quizId1, sessionId1).metadata.questions[1].answers[0].answerId;
  q2AnswerId2 = requestGetQuizSessionStatus(token1, quizId1, sessionId1).metadata.questions[1].answers[1].answerId;
  q2AnswerId3 = requestGetQuizSessionStatus(token1, quizId1, sessionId1).metadata.questions[1].answers[2].answerId;
  q2AnswerId4 = requestGetQuizSessionStatus(token1, quizId1, sessionId1).metadata.questions[1].answers[3].answerId;
});

describe('Errors', () => {
  test('player ID does not exist (400)', () => {
    const invalidPlayerId = playerId1 + 1;
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');
    requestPlayerAnswer(playerId1, 1, [q1AnswerId1]);
    requestPlayerAnswer(playerId2, 1, [q1AnswerId2]);
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_FINAL_RESULTS');
    expect(() => requestGetPlayerFinalResults(invalidPlayerId)).toThrow(HTTPError[400]);
  });

  test('Session is not in FINAL_RESULTS state (400)', () => {
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');
    requestPlayerAnswer(playerId1, 1, [q1AnswerId1]);
    requestPlayerAnswer(playerId2, 1, [q1AnswerId2]);
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER');
    expect(() => requestGetPlayerFinalResults(playerId1)).toThrow(HTTPError[400]);
  });
});

describe('Successful Run', () => {
  test('Quesiton 1 only', () => {
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');
    requestPlayerAnswer(playerId1, 1, [q1AnswerId1]);
    requestPlayerAnswer(playerId2, 1, [q1AnswerId2]);
    sleepSync(1000);
    requestPlayerAnswer(playerId3, 1, [q1AnswerId1]);
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_FINAL_RESULTS');
    expect(requestGetPlayerFinalResults(playerId1)).toStrictEqual({
      usersRankedByScore: [
        {
          name: 'Joe',
          score: 8
        },
        {
          name: 'Rock',
          score: 4
        },
        {
          name: 'Nosa',
          score: 0
        }
      ],
      questionResults: [
        {
          questionId: questionId1,
          playersCorrectList: ['Joe', 'Rock'],
          averageAnswerTime: Math.round(1 / 3),
          percentCorrect: Math.round(((2 / 3) * 100))
        }
      ]
    });
  });

  test('Question 1 and 2', () => {
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');
    requestPlayerAnswer(playerId1, 1, [q1AnswerId1]);
    sleepSync(1000);
    requestPlayerAnswer(playerId2, 1, [q1AnswerId2]);
    requestPlayerAnswer(playerId3, 1, [q1AnswerId1]);
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');
    requestPlayerAnswer(playerId1, 2, [q2AnswerId3, q2AnswerId1, q2AnswerId2]);
    sleepSync(1000);
    requestPlayerAnswer(playerId3, 2, [q2AnswerId4, q2AnswerId1]);
    sleepSync(5000);
    requestPlayerAnswer(playerId2, 2, [q2AnswerId4]);
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_FINAL_RESULTS');
    expect(requestGetPlayerFinalResults(playerId1)).toStrictEqual({
      usersRankedByScore: [
        {
          name: 'Rock',
          score: 14
        },
        {
          name: 'Joe',
          score: 8
        },
        {
          name: 'Nosa',
          score: 0
        }
      ],
      questionResults: [
        {
          questionId: questionId1,
          playersCorrectList: ['Joe', 'Rock'],
          averageAnswerTime: Math.round(2 / 3),
          percentCorrect: Math.round(((2 / 3) * 100))
        },
        {
          questionId: questionId2,
          playersCorrectList: ['Rock'],
          averageAnswerTime: Math.round(7 / 3),
          percentCorrect: Math.round(((1 / 3) * 100))
        }
      ]
    });
  });
});
