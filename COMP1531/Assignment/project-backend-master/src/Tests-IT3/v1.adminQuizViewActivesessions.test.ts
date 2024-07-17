import { requestAuthRegister, requestSessionStateUpdate, requestSessionView, requestCreateQuizQuestionV2, requestClear, requestQuizCreateV2, requestSessionStart } from './wrappers';
import HTTPError from 'http-errors';

function sleepSync(ms: number) {
  const startTime = new Date().getTime();
  while (new Date().getTime() - startTime < ms) {
    // zzzZZ - comment needed so eslint doesn't complain
  }
}

let testToken: string, quizId: number;
beforeEach(() => {
  requestClear();
  testToken = requestAuthRegister('validtest@gmail.com', 'valid123', 'validfirst', 'validlast').token;
  quizId = requestQuizCreateV2(testToken, 'Test Quiz', 'Description test for quiz.').quizId;
  requestCreateQuizQuestionV2(
    testToken,
    quizId,
    {
      question: 'Who is the Monarch of England?',
      duration: 1,
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
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    }
  );
}, 1000);

describe('Error Tests', () => {
  test('Error: Token is invalid', () => {
    const invalidToken1 = testToken + 'impossible token';
    const invalidToken2 = '';
    expect(() => requestSessionView(invalidToken1, quizId)).toThrow(HTTPError[401]);
    expect(() => requestSessionView(invalidToken2, quizId)).toThrow(HTTPError[401]);
  });

  test('Error: quiz ID is invalid', () => {
    const invalidquizid = quizId + 1;
    expect(() => requestSessionView(testToken, invalidquizid)).toThrow(HTTPError[403]);
  });

  test('Error: user does not own the quiz', () => {
    const testToken2 = requestAuthRegister('validextra@gmail.com', 'valid123', 'validfirstch', 'validlastch').token;
    expect(() => requestSessionView(testToken2, quizId)).toThrow(HTTPError[403]);
  });
});

describe('Correct Tests', () => {
  test('Correct return type', () => {
    const sessionId1 = requestSessionStart(testToken, 3, quizId).sessionId;
    const sessionId2 = requestSessionStart(testToken, 3, quizId).sessionId;
    const sessionId3 = requestSessionStart(testToken, 3, quizId).sessionId;
    const sessionId4 = requestSessionStart(testToken, 3, quizId).sessionId;
    const sessionId5 = requestSessionStart(testToken, 3, quizId).sessionId;
    const sessionId6 = requestSessionStart(testToken, 3, quizId).sessionId;
    const sessionId7 = requestSessionStart(testToken, 3, quizId).sessionId;
    const sessionId8 = requestSessionStart(testToken, 3, quizId).sessionId;
    const sessionId9 = requestSessionStart(testToken, 3, quizId).sessionId;

    // testing all states
    // QUESTION_CLOSE
    requestSessionStateUpdate(testToken, quizId, sessionId1, 'NEXT_QUESTION');
    requestSessionStateUpdate(testToken, quizId, sessionId1, 'SKIP_COUNTDOWN');
    sleepSync(2 * 1000);

    // FINAL_RESULTS
    requestSessionStateUpdate(testToken, quizId, sessionId2, 'NEXT_QUESTION');
    requestSessionStateUpdate(testToken, quizId, sessionId2, 'SKIP_COUNTDOWN');
    requestSessionStateUpdate(testToken, quizId, sessionId2, 'GO_TO_ANSWER');
    requestSessionStateUpdate(testToken, quizId, sessionId2, 'GO_TO_FINAL_RESULTS');

    // ANSWER_SHOW
    requestSessionStateUpdate(testToken, quizId, sessionId3, 'NEXT_QUESTION');
    requestSessionStateUpdate(testToken, quizId, sessionId3, 'SKIP_COUNTDOWN');
    requestSessionStateUpdate(testToken, quizId, sessionId3, 'GO_TO_ANSWER');

    // QUESTION_OPEN
    requestSessionStateUpdate(testToken, quizId, sessionId4, 'NEXT_QUESTION');
    requestSessionStateUpdate(testToken, quizId, sessionId4, 'SKIP_COUNTDOWN');

    // QUESTION_COUNTDOWN
    requestSessionStateUpdate(testToken, quizId, sessionId5, 'NEXT_QUESTION');

    // END
    requestSessionStateUpdate(testToken, quizId, sessionId7, 'END');
    requestSessionStateUpdate(testToken, quizId, sessionId8, 'END');
    requestSessionStateUpdate(testToken, quizId, sessionId9, 'END');

    const inactiveArray = [sessionId7, sessionId8, sessionId9].sort((a, b) => a - b);
    const activeArray = [sessionId1, sessionId2, sessionId3, sessionId4, sessionId5, sessionId6].sort((a, b) => a - b);
    // UPDATE FOLLOWING LINE, ALSO INCLUDE SESSIONS IN END STATE

    expect(requestSessionView(testToken, quizId)).toStrictEqual({
      activeSessions: activeArray,
      inactiveSessions: inactiveArray
    });
  });
});
