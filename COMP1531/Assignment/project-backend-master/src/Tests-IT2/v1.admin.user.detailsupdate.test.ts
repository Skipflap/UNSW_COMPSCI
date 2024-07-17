import { requestAuthRegister, requestUserDetailsUpdate, requestUserDetails, requestAuthLogin, requestClear } from './wrappers';

const ERROR = { error: expect.any(String) };
let testToken: string;
beforeEach(() => {
  requestClear();
  const test1 = requestAuthRegister('validtest@gmail.com', 'valid123', 'validfirst- \'', 'validlast- \'').bodyObject;
  if ('token' in test1) {
    testToken = test1.token;
  }
}, 1000);

describe('Error Tests', () => {
  test('Error: Token empty or invalid', () => {
    const invalidUser = 'impossible token';
    const responseTest = requestUserDetailsUpdate(invalidUser, 'valid@gmail.com', 'validfirst', 'validlast');
    expect(responseTest.status).toStrictEqual(401);
    expect(responseTest.bodyObject).toStrictEqual(ERROR);
    const responseTest2 = requestUserDetailsUpdate('', 'valid@gmail.com', 'validfirst', 'validlast');
    expect(responseTest2.status).toStrictEqual(401);
    expect(responseTest2.bodyObject).toStrictEqual(ERROR);
  });

  test('Error: Email is currently used by another user', () => {
    requestAuthRegister('sametest@gmail.com', 'valid123', 'validfirst', 'validlast');
    const responseTest = requestUserDetailsUpdate(testToken, 'sametest@gmail.com', 'validfirst', 'validlast');
    expect(responseTest.status).toStrictEqual(400);
    expect(responseTest.bodyObject).toStrictEqual(ERROR);
  });

  test('Error: Email is not valid', () => {
    const responseTest = requestUserDetailsUpdate(testToken, 'invalidemail', 'validfirst', 'validlast');
    expect(responseTest.status).toStrictEqual(400);
    expect(responseTest.bodyObject).toStrictEqual(ERROR);
  });

  test.each([
    { test: 'First name contains invalid characters', nameFirst: 'invalid@', nameLast: 'validname' },
    { test: 'First name is too short', nameFirst: 'a', nameLast: 'validname' },
    { test: 'First name is too long', nameFirst: 'invalidnameabcdefghij', nameLast: 'validname' },
    { test: 'Last name contains invalid characters', nameFirst: 'validname', nameLast: 'invalid@' },
    { test: 'Last name is too short', nameFirst: 'validname', nameLast: 'a' },
    { test: 'Last name is too long', nameFirst: 'validname', nameLast: 'invalidnameabcdefghij' }
  ])('Error: $test', ({ nameFirst, nameLast }) => {
    const responseTest = requestUserDetailsUpdate(testToken, 'valid@gmail.com', nameFirst, nameLast);
    expect(responseTest.status).toStrictEqual(400);
    expect(responseTest.bodyObject).toStrictEqual(ERROR);
  });
});

describe('Correct Tests', () => {
  test('Correct return type', () => {
    const responseTest = requestUserDetailsUpdate(testToken, 'valid@gmail.com', 'validlastch- \'', 'validlastch- \'');
    expect(responseTest.status).toStrictEqual(200);
    expect(responseTest.bodyObject).toStrictEqual({});
  });

  test('Correct behaviour and side effects: Email change successful', () => {
    requestUserDetailsUpdate(testToken, 'test_change@gmail.com', 'validfirst', 'validlast');
    const testDetails = requestUserDetails(testToken).bodyObject;
    let UserEmail: string;
    if ('user' in testDetails) {
      UserEmail = testDetails.user.email;
    }
    expect(UserEmail).toStrictEqual('test_change@gmail.com');
  });

  test.each([
    { test: 'First name change successful', nameFirst: 'changefirst', nameLast: 'validlast', name: 'changefirst validlast' },
    { test: 'Last name change successful', nameFirst: 'validfirst', nameLast: 'changelast', name: 'validfirst changelast' },
  ])('Correct behaviour and side effects: $test', ({ test, nameFirst, nameLast, name }) => {
    requestUserDetailsUpdate(testToken, 'test_change@gmail.com', nameFirst, nameLast);
    const testDetails = requestUserDetails(testToken).bodyObject;
    let UserName: string;
    if ('user' in testDetails) {
      UserName = testDetails.user.name;
    }
    expect(UserName).toStrictEqual(name);
  });

  test('Correct behaviour and side effects: Email change works on adminAuthLogin', () => {
    requestUserDetailsUpdate(testToken, 'test_change@gmail.com', 'validfirst', 'validlast');
    const testChange = requestAuthLogin('test_change@gmail.com', 'valid123').bodyObject;
    expect(testChange).toStrictEqual({ token: expect.any(String) });
  });
});
