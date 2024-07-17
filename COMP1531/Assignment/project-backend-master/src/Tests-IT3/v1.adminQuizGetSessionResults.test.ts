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
  requestGetPlayerFinalResults,
  requestSessionGetResults
} from './wrappers';

// Sleep function
function sleepSync(ms: number) {
  const startTime = new Date().getTime();
  while (new Date().getTime() - startTime < ms) {
    // zzzZZ - comment needed so eslint doesn't complain
  }
}

let token1, token2, firstQuizUser2, sessionId1, quizId1, questionId1,
  questionId2, playerId1, playerId2, playerId3, q1AnswerId1, q1AnswerId2, q2AnswerId1, q2AnswerId2, q2AnswerId3, q2AnswerId4;

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
  duration: 8,
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
  token1 = requestAuthRegister('lebron724@gmail.com', 'ball1234', 'Lebron', 'James').token;
  quizId1 = requestQuizCreateV2(token1, 'My Quiz Name', 'A description of my quiz').quizId;
  questionId1 = requestCreateQuizQuestionV2(token1, quizId1, validQuestion1).questionId;
  questionId2 = requestCreateQuizQuestionV2(token1, quizId1, validQuestion2).questionId;
  sessionId1 = requestSessionStart(token1, 0, quizId1).sessionId;

  token2 = requestAuthRegister('messi448@gmail.com', 'soccer2312', 'Leo', 'Messi').token;
  firstQuizUser2 = requestQuizCreateV2(token2, 'Soccer', '5 questions of Soccer teams').quizId;

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

describe('ERROR 400', () => {
  test('ERROR 400 - Session Id does not refer to a valid session within this quiz', () => {
    const invalidSessionId = sessionId1 + 1;
    expect(() => requestSessionGetResults(token1, invalidSessionId, quizId1)).toThrow(HTTPError[400]);
  });

  test('ERROR 400 - Session is not in FINAL_RESULTS state', () => {
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');
    requestPlayerAnswer(playerId1, 1, [q1AnswerId1]);
    requestPlayerAnswer(playerId2, 1, [q1AnswerId2]);
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER');
    expect(() => requestSessionGetResults(token1, sessionId1, quizId1)).toThrow(HTTPError[400]);
  });
});

describe('ERROR 401 - Token is empty or invalid', () => {
  test('ERROR 401 - Token Empty', () => {
    const emptyToken = '';
    expect(() => requestSessionGetResults(emptyToken, sessionId1, quizId1)).toThrow(HTTPError[401]);
  });

  test('ERROR 401 - Token Invalid', () => {
    const invalidToken = token1 + 100;
    expect(() => requestSessionGetResults(invalidToken, sessionId1, quizId1)).toThrow(HTTPError[401]);
  });
});

describe('ERROR 403 - Valid token is provided, but user is not an owner of this quiz', () => {
  test('ERROR 403 - For user owning 1 quiz', () => {
    expect(() => requestSessionGetResults(token1, sessionId1, firstQuizUser2)).toThrow(HTTPError[403]);
  });

  test('ERROR 403 - quiz doesnt exist', () => {
    requestClear();
    token1 = requestAuthRegister('lebron724@gmail.com', 'ball1234', 'Lebron', 'James').token;
    quizId1 = requestQuizCreateV2(token1, 'My Quiz Name', 'A description of my quiz').quizId;
    questionId1 = requestCreateQuizQuestionV2(token1, quizId1, validQuestion1).questionId;
    questionId2 = requestCreateQuizQuestionV2(token1, quizId1, validQuestion2).questionId;
    sessionId1 = requestSessionStart(token1, 0, quizId1).sessionId;
    expect(() => requestSessionGetResults(token1, sessionId1, quizId1 + 1)).toThrow(HTTPError[403]);
  });
});

describe('CORRECT TESTING FOR SESSION RESULTS', () => {
  test('Successful - Noone answers', () => {
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');
    requestPlayerAnswer(playerId1, 1, [q1AnswerId1]);
    requestPlayerAnswer(playerId2, 1, [q1AnswerId2]);
    sleepSync(1000);
    requestPlayerAnswer(playerId3, 1, [q1AnswerId1]);
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_FINAL_RESULTS');
    expect(requestSessionGetResults(token1, sessionId1, quizId1)).toStrictEqual({
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

  test('Successful - 2 players with 2 questions', () => {
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
    sleepSync(3000);
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
