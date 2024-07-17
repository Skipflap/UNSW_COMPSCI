import { requestQuizThumbnailUpdate, requestQuizCreateV2, requestAuthRegister, requestClear, requestGetQuizInfoV2 } from './wrappers';
import HTTPError from 'http-errors';

let testToken: string, quizId: number;
beforeEach(() => {
  requestClear();
  testToken = requestAuthRegister('validtest@gmail.com', 'valid123', 'validfirst- \'', 'validlast- \'').token;
  quizId = requestQuizCreateV2(testToken, 'Test Quiz', 'Description test for quiz.').quizId;
}, 1000);

describe('Error Tests', () => {
  test('Error: Token empty or invalid', () => {
    const invalidUser = testToken + 'impossible token';
    expect(() => requestQuizThumbnailUpdate(quizId, invalidUser, 'http://google.com/some/image/path.jpg')).toThrow(HTTPError[401]);
    expect(() => requestQuizThumbnailUpdate(quizId, '', 'http://google.com/some/image/path.jpg')).toThrow(HTTPError[401]);
  });

  test('Error: user does not own the quiz or quiz does not exist', () => {
    const testToken2 = requestAuthRegister('validextra@gmail.com', 'valid123', 'validfirstch', 'validlastch').token;
    expect(() => requestQuizThumbnailUpdate(quizId, testToken2, 'http://google.com/some/image/path.jpg')).toThrow(HTTPError[403]);
    expect(() => requestQuizThumbnailUpdate(quizId + 1, testToken, 'http://google.com/some/image/path.jpg')).toThrow(HTTPError[403]);
  });

  test.each([
    { test: 'imgUrl does not end with jpg, jpeg or png', imgUrl: 'http://google.com/some/image/path.jpag' },
    { test: 'imgUrl does not start with http:// or https://', imgUrl: 'htttps://google.com/some/image/path.jpeg' },
    { test: 'imgUrl does not start with http:// or https://, or end with jpg, jpeg or png', imgUrl: 'htttps://google.com/some/image/path.jpag' },
  ])('Error: $test', ({ imgUrl }) => {
    expect(() => requestQuizThumbnailUpdate(quizId, testToken, imgUrl)).toThrow(HTTPError[400]);
  });
});

describe('Correct Tests', () => {
  test.each([
    { test: 'correct url jpeg', imgUrl: 'http://google.com/some/image/path.jPeG' },
    { test: 'correct url jpg', imgUrl: 'http://google.com/some/image/path.JpG' },
    { test: 'correct url png', imgUrl: 'http://google.com/some/image/path.PnG' },
    { test: 'correct url http://', imgUrl: 'http://google.com/some/image/path.jpg' },
    { test: 'correct url https://', imgUrl: 'https://google.com/some/image/path.jpg' },
  ])('Correct return type: $test', ({ imgUrl }) => {
    expect(requestQuizThumbnailUpdate(quizId, testToken, imgUrl)).toStrictEqual({});
  });

  test('Correct behaviour and side effects: thumbnail change successful', () => {
    const timeEdited = Math.floor(Date.now() / 1000);
    requestQuizThumbnailUpdate(quizId, testToken, 'https://google.com/some/image/path.jpg');
    const quizDetail = requestGetQuizInfoV2(quizId, testToken);
    expect(quizDetail).toStrictEqual({
      quizId: quizId,
      name: 'Test Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Description test for quiz.',
      numQuestions: 0,
      questions: [],
      duration: 0,
      thumbnailUrl: 'https://google.com/some/image/path.jpg'
    });
    expect(quizDetail.timeLastEdited).toBeGreaterThanOrEqual(timeEdited);
    expect(quizDetail.timeLastEdited).toBeLessThanOrEqual(timeEdited + 2);
  });
});
