import { requestAuthRegister, requestUserDetailsUpdateV2, adminUserDetailsV2, requestAuthLogin, requestClear } from './wrappers';
import HTTPError from 'http-errors';

let testToken: string;
beforeEach(() => {
  requestClear();
  const test1 = requestAuthRegister('validtest@gmail.com', 'valid123', 'validfirst- \'', 'validlast- \'');
  if ('token' in test1) {
    testToken = test1.token;
  }
}, 1000);

describe('Error Tests', () => {
  test('Error: Token empty or invalid', () => {
    const invalidUser = testToken + 'impossible token';
    expect(() => requestUserDetailsUpdateV2(invalidUser, 'valid@gmail.com', 'validfirst', 'validlast')).toThrow(HTTPError[401]);
    expect(() => requestUserDetailsUpdateV2('', 'valid@gmail.com', 'validfirst', 'validlast')).toThrow(HTTPError[401]);
  });

  test('Error: Email is currently used by another user', () => {
    requestAuthRegister('sametest@gmail.com', 'valid123', 'validfirst', 'validlast');
    expect(() => requestUserDetailsUpdateV2(testToken, 'sametest@gmail.com', 'validfirst', 'validlast')).toThrow(HTTPError[400]);
  });

  test('Error: Email is not valid', () => {
    expect(() => requestUserDetailsUpdateV2(testToken, 'invalidemail', 'validfirst', 'validlast')).toThrow(HTTPError[400]);
  });

  test.each([
    { test: 'First name contains invalid characters', nameFirst: 'invalid@', nameLast: 'validname' },
    { test: 'First name is too short', nameFirst: 'a', nameLast: 'validname' },
    { test: 'First name is too long', nameFirst: 'invalidnameabcdefghij', nameLast: 'validname' },
    { test: 'Last name contains invalid characters', nameFirst: 'validname', nameLast: 'invalid@' },
    { test: 'Last name is too short', nameFirst: 'validname', nameLast: 'a' },
    { test: 'Last name is too long', nameFirst: 'validname', nameLast: 'invalidnameabcdefghij' }
  ])('Error: $test', ({ nameFirst, nameLast }) => {
    expect(() => requestUserDetailsUpdateV2(testToken, 'valid@gmail.com', nameFirst, nameLast)).toThrow(HTTPError[400]);
  });
});

describe('Correct Tests', () => {
  test('Correct return type', () => {
    expect(requestUserDetailsUpdateV2(testToken, 'valid@gmail.com', 'validlastch- \'', 'validlastch- \'')).toStrictEqual({});
  });

  test('Correct behaviour and side effects: Email change successful', () => {
    requestUserDetailsUpdateV2(testToken, 'test_change@gmail.com', 'validfirst', 'validlast');
    const testDetails = adminUserDetailsV2(testToken);
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
    requestUserDetailsUpdateV2(testToken, 'test_change@gmail.com', nameFirst, nameLast);
    const testDetails = adminUserDetailsV2(testToken);
    let UserName: string;
    if ('user' in testDetails) {
      UserName = testDetails.user.name;
    }
    expect(UserName).toStrictEqual(name);
  });

  test('Correct behaviour and side effects: Email change works on adminAuthLogin', () => {
    requestUserDetailsUpdateV2(testToken, 'test_change@gmail.com', 'validfirst', 'validlast');
    const testChange = requestAuthLogin('test_change@gmail.com', 'valid123');
    expect(testChange).toStrictEqual({ token: expect.any(String) });
  });
});
