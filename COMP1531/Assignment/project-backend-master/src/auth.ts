import validator from 'validator';
import { getData, saveData } from './dataStore';
import { UserIdReturn, ErrorObject, UserDetailReturn, User, Empty } from './interface';
import { invalidNameCharacters, getHashOf, invalidpassword } from './helper';
import HTTPError from 'http-errors';

const tokenMaker = (): string => {
  const data = getData();
  let answer;
  do {
    answer = Math.floor((Math.random() * 899999) + 100000);
  } while (data.tokens.find((token) => token.token === answer.toString()) !== undefined);

  return answer.toString();
};

/**
  * adminAuthRegister registers a new author to the database and returns the registers new user id
  *
  * @param {string} email - User's email to sign up
  * @param {string} password - Password to sign up
  * @param {string} nameFirst - First name of User
  * @param {string} nameLast - Surname of User
  * @returns {authUserId: <int>} - Returns unique Id to user given valid inputs
*/
export const adminAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string): UserIdReturn | ErrorObject => {
  const data = getData();
  const check = data.users.find((user) => user.email === email);

  if (check !== undefined) {
    return { error: 'invalid email' };
  }

  if (validator.isEmail(email) === false) {
    return { error: 'Email is already in use' };
  }

  if (invalidNameCharacters(nameFirst)) {
    return { error: 'Invalid first name' };
  }

  if (nameFirst.length > 20 || nameFirst.length < 2) {
    if (nameFirst.length > 20) {
      return { error: 'First name is too long' };
    } else {
      return { error: 'First name is too short' };
    }
  }

  if (invalidNameCharacters(nameLast)) {
    return { error: 'Invalid last name' };
  }

  if (nameLast.length > 20 || nameLast.length < 2) {
    if (nameLast.length > 20) {
      return { error: 'Last name is too long' };
    } else {
      return { error: 'Last name is too short' };
    }
  }

  if (password.length < 8) {
    return { error: 'Password is too short' };
  }

  if (invalidpassword(password)) {
    return { error: 'Password must have atleast 1 letter and 1 number' };
  }

  const listOfPassword: string[] = [];
  const listOfQuizzes: number[] = [];

  const x = data.users.length;
  const NewUser: User = {
    userId: x,
    nameFirst,
    nameLast,
    password: getHashOf(password),
    oldPasswords: listOfPassword,
    email,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
    quizId: listOfQuizzes,
  };

  const encodedToken = tokenMaker();

  const newToken = {
    userId: x,
    token: encodedToken
  };

  data.tokens.push(newToken);
  data.users.push(NewUser);

  saveData(data);

  return {
    token: encodedToken
  };
};

/**
  * adminAuthLogin takes an email and password variable and returns an id assosciated with the
  * email and password.
  *
  * @param {string} email - User's email
  * @param {string} password - User's Password
  *
  * @returns {authUserId: <int>} - Returns unique Id to user given valid inputs.
*/
export const adminAuthLogin = (email: string, password: string): UserIdReturn | ErrorObject => {
  const data = getData();
  const check = data.users.find((users) => users.email === email);

  if (check === undefined) {
    return { error: 'invalid email' };
  }

  if (check.password !== getHashOf(password)) {
    check.numFailedPasswordsSinceLastLogin++;
    return { error: 'invalid password' };
  }

  check.numFailedPasswordsSinceLastLogin = 0;
  check.numSuccessfulLogins++;

  const encodedToken = tokenMaker();

  const newToken = {
    userId: check.userId,
    token: encodedToken
  };
  data.tokens.push(newToken);

  saveData(data);

  return {
    token: encodedToken
  };
};

export const adminAuthLogout = (tuuken: string): Empty | ErrorObject => {
  const data = getData();

  if (tuuken === '') {
    throw HTTPError(401, '401 - Invalid token');
  }

  const check = data.tokens.find((tokens) => tokens.token === tuuken);
  if (check === undefined) {
    throw HTTPError(401, '401 - Invalid token');
  }

  const index = data.tokens.findIndex(element => element.token === tuuken);
  data.tokens.splice(index, 1);

  saveData(data);

  return {};
};

/**
  * adminUserDetails takes the UserId and returns information on user.
  *
  * @param {number} authUserId - User's unique Id
  * @returns {userId: <int>, name: <string>, email: <string>,
  * numSuccessfulLogins: <int>, numFailedPasswordsSinceLastLogin <int>}
  * - Returns object to user given valid inputs
*/

export const adminUserDetails = (token: string): UserDetailReturn | ErrorObject => {
  const data = getData();
  const check = data.tokens.find((tokens) => tokens.token === token);
  if (check === undefined) {
    throw HTTPError(401, '401 - Invalid token');
  }

  const user = data.users.find((users) => users.userId === check.userId);
  const CheckedUser = {
    userId: user.userId,
    name: user.nameFirst + ' ' + user.nameLast,
    email: user.email,
    numSuccessfulLogins: user.numSuccessfulLogins,
    numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
  };
  return { user: CheckedUser };
};

/**
  * Update the authorised users details based of given parameters
  *
  * @param {string} token - an identification in the token array
  * @param {string} email - an email that will replace current
  * @param {string} nameFirst - a first name that will replace current
  * @param {string} nameLast - a first name that will replace current
  *
  * @returns {} - if parameters are valid returns empty object
*/
export const adminUserDetailsUpdate = (token: string, email: string, nameFirst: string, nameLast: string): NonNullable<unknown> | ErrorObject => {
  const data = getData();
  const MaxLength = 20;
  const MinLength = 2;

  const index = data.tokens.findIndex(tokens => tokens.token.includes(token));

  // check if token is located in the database
  if (index === -1 || token === '') {
    throw HTTPError(401, 'Token does not refer to valid logged in user session');
  }

  const userId = data.tokens[index].userId;

  const cloneUsersArr = data.users.slice();
  cloneUsersArr.splice(userId, 1);

  // Search through every email besides current authorised user
  if (cloneUsersArr.some(users => users.email === email)) {
    throw HTTPError(400, 'Email is currently used by another user');
  } else if (validator.isEmail(email) === false) {
    throw HTTPError(400, 'Email is not valid');
  }

  // If statements checking if the first or last name follow the
  // specifications
  if (invalidNameCharacters(nameFirst)) {
    throw HTTPError(400, 'First name contains invalid characters');
  } else if (nameFirst.length < MinLength) {
    throw HTTPError(400, 'First name is too short');
  } else if (nameFirst.length > MaxLength) {
    throw HTTPError(400, 'First name is too long');
  } else if (invalidNameCharacters(nameLast)) {
    throw HTTPError(400, 'Last name contains invalid characters');
  } else if (nameLast.length < MinLength) {
    throw HTTPError(400, 'Last name is too short');
  } else if (nameLast.length > MaxLength) {
    throw HTTPError(400, 'Last name is too long');
  }

  // if passed all errors update according to the parameters
  data.users[userId].email = email;
  data.users[userId].nameFirst = nameFirst;
  data.users[userId].nameLast = nameLast;

  saveData(data);

  return {};
};

/**
  * Update the authorised users password
  *
  * @param {string} token - an identification in the users array
  * @param {string} oldPassword - the current password of a user
  * @param {string} newPassword - a new password that will replace the current
  *
  * @returns {} - if parameters are valid returns empty object
*/
export const adminUserPasswordUpdate = (token: string, oldPassword: string, newPassword: string): NonNullable<unknown> | ErrorObject => {
  const data = getData();
  const minLength = 8;
  const oldPasswordHash = getHashOf(oldPassword);
  const newPasswordHash = getHashOf(newPassword);

  const index = data.tokens.findIndex(tokens => tokens.token.includes(token));

  // check if token is located in the database
  if (index === -1 || token === '') {
    throw HTTPError(401, 'Token does not refer to valid logged in user session');
  }

  const userId = data.tokens[index].userId;

  // Check if inputted password is correct
  if (data.users[userId].password !== oldPasswordHash) {
    throw HTTPError(400, 'Old password is incorrect');
  }
  // Check if the inputted password match
  if (oldPassword === newPassword) {
    throw HTTPError(400, 'Old password and new password match');
  }
  // Check old password array to see if password has been used before
  if (data.users[userId].oldPasswords.includes(newPasswordHash)) {
    throw HTTPError(400, 'New password has been used before');
  }
  // Check if the new password is a valid length
  if (newPassword.length < minLength) {
    throw HTTPError(400, 'New password is less than 8 characters');
  }
  // Using a test, checking if the password contains at least 1 number and letter
  if ((/[a-zA-Z]/.test(newPassword) === false) || (/\d/.test(newPassword) === false)) {
    throw HTTPError(400, 'New password does not contain at least 1 number and at least 1 letter');
  }
  // Update the according to the function

  data.users[userId].password = newPasswordHash;
  data.users[userId].oldPasswords.push(oldPasswordHash);

  saveData(data);

  return {};
};
