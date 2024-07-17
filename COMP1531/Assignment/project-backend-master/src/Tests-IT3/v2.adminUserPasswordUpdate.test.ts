import { requestAuthRegister, requestAuthLogin, requestClear, requestUserPasswordUpdateV2 } from './wrappers';
import HTTPError from 'http-errors';

// const ERROR = { error: expect.any(String) };
let testToken: string;
beforeEach(() => {
  requestClear();
  const test1 = requestAuthRegister('validtest@gmail.com', 'valid123', 'validfirst', 'validlast');
  if ('token' in test1) {
    testToken = test1.token;
  }
}, 1000);

describe('Error Tests', () => {
  test('Error: AuthUserId is not a valid user', () => {
    expect(() => requestUserPasswordUpdateV2('impossible token', 'valid_old', 'valid_new')).toThrow(HTTPError[401]);
    expect(() => requestUserPasswordUpdateV2('', 'valid_old', 'valid_new')).toThrow(HTTPError[401]);
  });

  test('Error: New password has been used before', () => {
    requestUserPasswordUpdateV2(testToken, 'valid123', 'validnew123');
    expect(() => requestUserPasswordUpdateV2(testToken, 'validnew123', 'valid123')).toThrow(HTTPError[400]);
  });

  test.each([
    { test: 'Old password is incorrect', oldPassword: 'invalid123', newPassword: 'validnew123' },
    { test: 'Old password and new password match', oldPassword: 'valid123', newPassword: 'valid123' },
    { test: 'New password is less than 8 characters', oldPassword: 'valid123', newPassword: 'err1' },
    { test: 'New password does not contain at least 1 number and at least 1 letter', oldPassword: 'valid123', newPassword: 'invalidpassword' },
    { test: 'New password does not contain at least 1 number and at least 1 letter', oldPassword: 'valid123', newPassword: '123456789' }
  ])('Error: $test', ({ oldPassword, newPassword }) => {
    expect(() => requestUserPasswordUpdateV2(testToken, oldPassword, newPassword)).toThrow(HTTPError[400]);
  });
});

describe('Correct Tests', () => {
  test('Correct return type', () => {
    expect(requestUserPasswordUpdateV2(testToken, 'valid123', 'validnew123')).toStrictEqual({ });
  });

  test('Correct behaviour and side effects: Password change successful', () => {
    requestUserPasswordUpdateV2(testToken, 'valid123', 'validnew123');
    expect(requestAuthLogin('validtest@gmail.com', 'validnew123')).toStrictEqual({ token: expect.any(String) });
  });
});
