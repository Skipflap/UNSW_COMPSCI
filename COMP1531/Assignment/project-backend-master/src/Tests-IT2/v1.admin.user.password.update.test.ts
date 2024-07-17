import { requestAuthRegister, requestAuthLogin, requestClear, requestUserPasswordUpdate } from './wrappers';

const ERROR = { error: expect.any(String) };
let testToken: string;
beforeEach(() => {
  requestClear();
  const test1 = requestAuthRegister('validtest@gmail.com', 'valid123', 'validfirst', 'validlast').bodyObject;
  if ('token' in test1) {
    testToken = test1.token;
  }
}, 1000);

describe('Error Tests', () => {
  test('Error: AuthUserId is not a valid user', () => {
    const invalidToken = 'impossible token';
    const responseTest = requestUserPasswordUpdate(invalidToken, 'valid_old', 'valid_new');
    expect(responseTest.status).toStrictEqual(401);
    expect(responseTest.bodyObject).toStrictEqual(ERROR);
    const responseTest2 = requestUserPasswordUpdate('', 'valid_old', 'valid_new');
    expect(responseTest2.status).toStrictEqual(401);
    expect(responseTest2.bodyObject).toStrictEqual(ERROR);
  });

  test('Error: New password has been used before', () => {
    requestUserPasswordUpdate(testToken, 'valid123', 'validnew123');
    const responseTest = requestUserPasswordUpdate(testToken, 'validnew123', 'valid123');
    expect(responseTest.status).toStrictEqual(400);
    expect(responseTest.bodyObject).toStrictEqual(ERROR);
  });

  test.each([
    { test: 'Old password is incorrect', oldPassword: 'invalid123', newPassword: 'validnew123' },
    { test: 'Old password and new password match', oldPassword: 'valid123', newPassword: 'valid123' },
    { test: 'New password is less than 8 characters', oldPassword: 'valid123', newPassword: 'err1' },
    { test: 'New password does not contain at least 1 number and at least 1 letter', oldPassword: 'valid123', newPassword: 'invalidpassword' },
    { test: 'New password does not contain at least 1 number and at least 1 letter', oldPassword: 'valid123', newPassword: '123456789' }
  ])('Error: $test', ({ oldPassword, newPassword }) => {
    const responseTest = requestUserPasswordUpdate(testToken, oldPassword, newPassword);
    expect(responseTest.status).toStrictEqual(400);
    expect(responseTest.bodyObject).toStrictEqual(ERROR);
  });
});

describe('Correct Tests', () => {
  test('Correct return type', () => {
    const responseTest = requestUserPasswordUpdate(testToken, 'valid123', 'validnew123');
    expect(responseTest.status).toStrictEqual(200);
    expect(responseTest.bodyObject).toStrictEqual({ });
  });

  test('Correct behaviour and side effects: Password change successful', () => {
    requestUserPasswordUpdate(testToken, 'valid123', 'validnew123');
    const testChange = requestAuthLogin('validtest@gmail.com', 'validnew123');
    expect(testChange.bodyObject).toStrictEqual({ token: expect.any(String) });
  });
});
