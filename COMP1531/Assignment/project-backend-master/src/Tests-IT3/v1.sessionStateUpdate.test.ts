import HTTPError from 'http-errors';
import {
  requestAuthRegister,
  requestQuizCreateV2,
  requestSessionStart,
  requestClear,
  requestSessionStateUpdate,
  requestGetQuizSessionStatus,
  requestCreateQuizQuestionV2
} from './wrappers';
import { ACTION } from '../interface';

// Sleep function
function sleepSync(ms: number) {
  const startTime = new Date().getTime();
  while (new Date().getTime() - startTime < ms) {
    // zzzZZ - comment needed so eslint doesn't complain
  }
}

// Tests
let token1 : string, quizId1 : number, sessionId1: number;
let quizId2: number, secondSessionId1: number;
let token2: string;
// let questionId1: number, questionId2: number, questionId3: number, secondquestionId1: number;
const validQuestion1 = {
  question: 'Favorite icecream flavor?',
  duration: 1,
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
  duration: 1,
  points: 2,
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
const validQuestion3 = {
  question: 'Favorite hobby?',
  duration: 1,
  points: 8,
  answers: [
    {
      answer: 'Gameing',
      correct: true
    },
    {
      answer: 'Reading',
      correct: false
    },
    {
      answer: 'Sports',
      correct: false
    },
    {
      answer: 'Eating',
      correct: false
    }
  ],
  thumbnailUrl: 'http://google.com/some/image/path.jpg',
};

beforeEach(() => {
  requestClear();

  token1 = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith').token;
  quizId1 = requestQuizCreateV2(token1, 'My Quiz Name', 'A description of my quiz').quizId;
  requestCreateQuizQuestionV2(token1, quizId1, validQuestion1); // questionId1
  requestCreateQuizQuestionV2(token1, quizId1, validQuestion2); // questionId2
  requestCreateQuizQuestionV2(token1, quizId1, validQuestion3); // questionId3
  sessionId1 = requestSessionStart(token1, 0, quizId1).sessionId;

  quizId2 = requestQuizCreateV2(token1, 'ONe Quiz Name', 'A description of my quiz').quizId;
  requestCreateQuizQuestionV2(token1, quizId2, validQuestion1); // secondquestionId1
  secondSessionId1 = requestSessionStart(token1, 0, quizId2).sessionId;
  token2 = requestAuthRegister('berb.gray@unsw.edu.au', 'berbgray183', 'Berb', 'Gray').token;
});

describe('Errors', () => {
  test('Token is empty (401)', () => {
    const emptyToken = '';
    expect(() => requestSessionStateUpdate(emptyToken, quizId1, sessionId1, 'END')).toThrow(HTTPError[401]);
  });
  test('Token is invalid (401)', () => {
    const invalidToken = token1 + 'Invalid Token';
    expect(() => requestSessionStateUpdate(invalidToken, quizId1, sessionId1, 'END')).toThrow(HTTPError[401]);
  });

  test('Valid token, user is not owner of quiz (403)', () => {
    expect(() => requestSessionStateUpdate(token2, quizId1, sessionId1, 'END')).toThrow(HTTPError[403]);
  });

  test('Session Id does not refer to a valid session with this quiz (400)', () => {
    const invalidSessionId = sessionId1 + 1;
    expect(() => requestSessionStateUpdate(token1, quizId1, invalidSessionId, 'END')).toThrow(HTTPError[400]);

    expect(() => requestSessionStateUpdate(token1, quizId1, secondSessionId1, 'END')).toThrow(HTTPError[400]);
  });

  test('Valid token is provided, but quiz does not exist (403)', () => {
    requestClear();
    token1 = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith').token;
    quizId1 = requestQuizCreateV2(token1, 'My Quiz Name', 'A description of my quiz').quizId;
    requestCreateQuizQuestionV2(token1, quizId1, validQuestion1);
    sessionId1 = requestSessionStart(token1, 0, quizId1).sessionId;
    expect(() => requestSessionStateUpdate(token1, quizId1 + 1, sessionId1, 'END')).toThrow(HTTPError[403]);
  });

  test('Action provided is not a valid Action enum (400)', () => {
    expect(() => requestSessionStateUpdate(token1, quizId1, sessionId1, 'OPEN' as ACTION)).toThrow(HTTPError[400]);
  });

  test('Action enum cannot be applied in the current state (400) - state: LOBBY', () => {
    expect(() => requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER')).toThrow(HTTPError[400]);
    expect(() => requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN')).toThrow(HTTPError[400]);
    expect(() => requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_FINAL_RESULTS')).toThrow(HTTPError[400]);
  });
  test('Action enum cannot be applied in the current state (400) - state: QUESTION_COUNTDOWN', () => {
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    expect(() => requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION')).toThrow(HTTPError[400]);
    expect(() => requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER')).toThrow(HTTPError[400]);
    expect(() => requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_FINAL_RESULTS')).toThrow(HTTPError[400]);
  });
  test('Action enum cannot be applied in the current state (400) - state: QUESTION_OPEN', () => {
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');
    expect(() => requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION')).toThrow(HTTPError[400]);
    expect(() => requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN')).toThrow(HTTPError[400]);
    expect(() => requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_FINAL_RESULTS')).toThrow(HTTPError[400]);
  });
  test('Action enum cannot be applied in the current state (400) - state: QUESTION_CLOSE', () => {
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');
    sleepSync(2 * 1000);
    expect(() => requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN')).toThrow(HTTPError[400]);
  });
  test('Action enum cannot be applied in the current state (400) - state: ANSWER_SHOW', () => {
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER');
    expect(() => requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN')).toThrow(HTTPError[400]);
    expect(() => requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER')).toThrow(HTTPError[400]);
  });
  test('Action enum cannot be applied in the current state (400) - state: FINAL_RESULTS', () => {
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_FINAL_RESULTS');
    expect(() => requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN')).toThrow(HTTPError[400]);
    expect(() => requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER')).toThrow(HTTPError[400]);
    expect(() => requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_FINAL_RESULTS')).toThrow(HTTPError[400]);
    expect(() => requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION')).toThrow(HTTPError[400]);
  });
  test('Action enum cannot be applied in the current state (400) - state: END', () => {
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'END');
    expect(() => requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER')).toThrow(HTTPError[400]);
    expect(() => requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN')).toThrow(HTTPError[400]);
    expect(() => requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_FINAL_RESULTS')).toThrow(HTTPError[400]);
    expect(() => requestSessionStateUpdate(token1, quizId1, sessionId1, 'END')).toThrow(HTTPError[400]);
    expect(() => requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION')).toThrow(HTTPError[400]);
  });
});

describe('Successful Runs', () => {
  // LOBBY
  test('Successful Run - State LOBBY => QUESTION_COUNTDOWN - NEXT_QUESTION', () => {
    expect(requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION')).toStrictEqual({});
    const sessionStatus = requestGetQuizSessionStatus(token1, quizId1, sessionId1);
    expect(sessionStatus.state).toStrictEqual('QUESTION_COUNTDOWN');
  });
  test('Successful Run - State LOBBY => END - END', () => {
    expect(requestSessionStateUpdate(token1, quizId1, sessionId1, 'END')).toStrictEqual({});
    const sessionStatus = requestGetQuizSessionStatus(token1, quizId1, sessionId1);
    expect(sessionStatus.state).toStrictEqual('END');
  });

  // QUESTION_COUNTDOWN
  test('Successful Run - State QUESTION_COUNTDOWN => QUESTION_OPEN - SKIP_COUNTDOWN', () => {
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    expect(requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN')).toStrictEqual({});
    const sessionStatus = requestGetQuizSessionStatus(token1, quizId1, sessionId1);
    expect(sessionStatus.state).toStrictEqual('QUESTION_OPEN');
  });
  test('Successful Run - State QUESTION_COUNTDOWN => QUESTION_OPEN - wait 3secs', () => {
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    sleepSync(3 * 1100);
    const sessionStatus = requestGetQuizSessionStatus(token1, quizId1, sessionId1);
    expect(sessionStatus.state).toStrictEqual('QUESTION_OPEN');
  });
  test('Successful Run - State QUESTION_COUNTDOWN => END - END', () => {
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    expect(requestSessionStateUpdate(token1, quizId1, sessionId1, 'END')).toStrictEqual({});
    const sessionStatus = requestGetQuizSessionStatus(token1, quizId1, sessionId1);
    expect(sessionStatus.state).toStrictEqual('END');
  });

  // QUESTION OPEN
  test('Successful Run - State QUESTION_OPEN => ANSWER_SHOW - GO_TO_ANSWER', () => {
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');
    expect(requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER')).toStrictEqual({});
    const sessionStatus = requestGetQuizSessionStatus(token1, quizId1, sessionId1);
    expect(sessionStatus.state).toStrictEqual('ANSWER_SHOW');
    // Check question results
  });
  test('Successful Run - State QUESTION_OPEN => QUESTION_CLOSE - wait duration', () => {
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');
    sleepSync(2 * 1000);
    const sessionStatus = requestGetQuizSessionStatus(token1, quizId1, sessionId1);
    expect(sessionStatus.state).toStrictEqual('QUESTION_CLOSE');
    // check question results
  });
  test('Successful Run - State QUESTION_OPEN => END - END', () => {
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');
    expect(requestSessionStateUpdate(token1, quizId1, sessionId1, 'END')).toStrictEqual({});
    const sessionStatus = requestGetQuizSessionStatus(token1, quizId1, sessionId1);
    expect(sessionStatus.state).toStrictEqual('END');
  });

  // QUESTION_CLOSE
  test('Successful Run - State QUESTION_CLOSE => ANSWER_SHOW - GO_TO_ANSWER', () => {
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');
    sleepSync(2 * 1000);
    expect(requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER')).toStrictEqual({});
    const sessionStatus = requestGetQuizSessionStatus(token1, quizId1, sessionId1);
    expect(sessionStatus.state).toStrictEqual('ANSWER_SHOW');
  });
  test('Successful Run - State QUESTION_CLOSE => FINAL_RESULTS - GO_TO_FINAL_RESULTS', () => {
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');
    sleepSync(2 * 1000);
    expect(requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_FINAL_RESULTS')).toStrictEqual({});
    const sessionStatus = requestGetQuizSessionStatus(token1, quizId1, sessionId1);
    expect(sessionStatus.state).toStrictEqual('FINAL_RESULTS');
  });
  test('Successful Run - State QUESTION_CLOSE => QUESTION_COUNTDOWN - NEXT_QUESTION', () => {
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');
    sleepSync(2 * 1000);
    expect(requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION')).toStrictEqual({});
    const sessionStatus = requestGetQuizSessionStatus(token1, quizId1, sessionId1);
    expect(sessionStatus.state).toStrictEqual('QUESTION_COUNTDOWN');
    expect(sessionStatus.atQuestion).toStrictEqual(2);
  });
  test('Successful Run - State QUESTION_CLOSE => END - END', () => {
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');
    sleepSync(2 * 1000);
    expect(requestSessionStateUpdate(token1, quizId1, sessionId1, 'END')).toStrictEqual({});
    const sessionStatus = requestGetQuizSessionStatus(token1, quizId1, sessionId1);
    expect(sessionStatus.state).toStrictEqual('END');
  });

  // SHOW_ANSWER
  test('Successful Run - State ANSWER_SHOW => QUESTION_COUNTDOWN - NEXT_QUESTION', () => {
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER');
    expect(requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION')).toStrictEqual({});
    const sessionStatus = requestGetQuizSessionStatus(token1, quizId1, sessionId1);
    expect(sessionStatus.state).toStrictEqual('QUESTION_COUNTDOWN');
    expect(sessionStatus.atQuestion).toStrictEqual(2);
  });
  test('Successful Run - State ANSWER_SHOW => FINAL_RESULTS - GO_TO_FINAL_RESULTS', () => {
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER');
    expect(requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_FINAL_RESULTS')).toStrictEqual({});
    const sessionStatus = requestGetQuizSessionStatus(token1, quizId1, sessionId1);
    expect(sessionStatus.state).toStrictEqual('FINAL_RESULTS');
  });
  test('Successful Run - State ANSWER_SHOW => END - END', () => {
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER');
    expect(requestSessionStateUpdate(token1, quizId1, sessionId1, 'END')).toStrictEqual({});
    const sessionStatus = requestGetQuizSessionStatus(token1, quizId1, sessionId1);
    expect(sessionStatus.state).toStrictEqual('END');
  });

  // FINAL_RESULTS
  test('Successful Run - State FINAL_RESULTS => END - END', () => {
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER');
    requestSessionStateUpdate(token1, quizId1, sessionId1, 'GO_TO_FINAL_RESULTS');
    expect(requestSessionStateUpdate(token1, quizId1, sessionId1, 'END')).toStrictEqual({});
    const sessionStatus = requestGetQuizSessionStatus(token1, quizId1, sessionId1);
    expect(sessionStatus.state).toStrictEqual('END');
  });
});
