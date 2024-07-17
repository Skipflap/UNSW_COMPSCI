// quiz.js
// This program was written by CRUNCHIE
import { getData, saveData } from './dataStore';
import { ErrorObject, QuizQuestionIdReturn, Questions, QuizIdReturn, Empty, QuizListReturn, QuizInfoReturn, QuizInfoReturnV2, Quiz, QuestionBody, NewQuizQuestionIdReturn, Answers, QuestionsV2 } from './interface';
import HTTPError from 'http-errors';
import { findSessions, validImgUrl, getRandomColour } from './helper';

/**
* This function provides a list of all quizzes owned by the requested user.
* @param {string} userToken - token of the user whose quizzes are to be retrieved
* @returns {quizId: <int>, name: <string>} - If authUserId is invalid, returns an error object
*                                          - If adminQuizList runs successfully, returns quiz object contains its ID and name
*/
export const adminQuizList = (userToken: string): QuizListReturn | ErrorObject => {
  const data = getData();
  const index = data.tokens.findIndex(index => index.token.includes(userToken));
  if (index === -1 || userToken === '') {
    throw HTTPError(401, 'Invalid token');
  }
  const authUserId = data.tokens[index].userId;

  const quiArray = [];
  for (const quiz of data.quizzes) {
    if (quiz.creatorId === authUserId) {
      quiArray.push({ quizId: quiz.quizId, name: quiz.name });
    }
  }

  return { quizzes: quiArray };
};

/**
 * Given basic details about a new quiz, create one for the logged in user.
 * @param {number} userToken - token of the user whose quizzes are to be retrieved
 * @param {string} name - name of the new quiz to be added
 * @returns {{quizId: number}} - If authUserId, name or description is invalid, returns an error object
 *                             - If adminQuizCreate runs successfully, an object is returned containing id of new quiz
 */
export const adminQuizCreate = (userToken: string, name: string, description: string, versionTwo: boolean): QuizIdReturn | ErrorObject => {
  const data = getData();

  // const index = data.tokens.findIndex(index => index.token.includes(userToken));
  const userIndex = data.tokens.findIndex(user => user.token === userToken);
  if (userIndex === -1 || userToken === '') {
    throw HTTPError(401, 'Invalid token');
  }
  const authUserId = data.tokens[userIndex].userId;

  if (description.length > 100) {
    throw HTTPError(400, 'Description must be no more than 100 characters');
  }

  if (name.length > 30 || name.length < 3) {
    throw HTTPError(400, 'Name must be greater than 3 characters and less than 30');
  }

  const regex = /[^A-Za-z0-9\s]/;
  if (regex.test(name)) {
    throw HTTPError(400, 'Name cannot contain special characters');
  }

  if (data.quizzes.filter(quiz => quiz.creatorId === authUserId && quiz.name === name).length > 0) {
    throw HTTPError(400, 'Name already exists');
  }

  // Create new quiz for user
  const max = 10000;
  let newQuizId:number;

  do {
    newQuizId = Math.floor(Math.random() * max);
  } while (data.quizzes.some(quizzes => quizzes.quizId === newQuizId));

  const timeMade = Math.floor(Date.now() / 1000);
  const timeEdited = Math.floor(Date.now() / 1000);

  const newQuiz: Quiz = {
    quizId: newQuizId,
    creatorId: authUserId,
    name: name,
    timeCreated: timeMade,
    timeLastEdited: timeEdited,
    description: description,
    numQuestions: 0,
    questions: [],
    duration: 0,
  };

  if (versionTwo === true) {
    newQuiz.thumbnail = '';
  }

  data.quizzes.push(newQuiz);

  data.users[userIndex].quizId.push(newQuizId);

  saveData(data);

  return {
    quizId: newQuizId
  };
};

/**
* Get all of the relevant information about the current quiz.
* @param {string} token - session id of the user who owns quiz
* @param {int} quizId - Unique Id of Quiz
* @returns {quizId: <int>, name: <string>, timeCreated: <int>, timeLastEdited: <int>, descritption: <string>}
* - Returns information given that a valid User owns a valid quiz.
*/
export const adminQuizInfo = (token: string, quizId: number): QuizInfoReturn | ErrorObject => {
  const data = getData();

  const userIndex = data.tokens.findIndex(tokens => tokens.token.includes(token));

  if (token === '' || userIndex === -1) {
    throw HTTPError(401, 'Token is empty or invalid');
  }

  const userId = data.tokens[userIndex].userId;

  const quizIndex = data.quizzes.findIndex(quizzes => quizzes.quizId === quizId);

  // Check if quiz is in the data
  if (quizIndex === -1) {
    throw HTTPError(403, 'QuizId invalid');
  }

  // Check if user owns quiz
  if (data.quizzes[quizIndex].creatorId !== userId) {
    throw HTTPError(403, 'User does not own the quiz');
  }

  const quizInfo = {

    quizId: data.quizzes[quizIndex].quizId,
    name: data.quizzes[quizIndex].name,
    timeCreated: data.quizzes[quizIndex].timeCreated,
    timeLastEdited: data.quizzes[quizIndex].timeLastEdited,
    numQuestions: data.quizzes[quizIndex].numQuestions,
    description: data.quizzes[quizIndex].description,
    questions: data.quizzes[quizIndex].questions,
    duration: data.quizzes[quizIndex].duration,

  };

  return quizInfo;
};

/**
* Get all of the relevant information about the current quiz.
* @param {string} token - session id of the user who owns quiz
* @param {int} quizId - Unique Id of Quiz
* @returns {quizId: <int>, name: <string>, timeCreated: <int>, timeLastEdited: <int>, descritption: <string>}
* - Returns information given that a valid User owns a valid quiz.
*/
export const adminQuizInfoV2 = (token: string, quizId: number): QuizInfoReturnV2 | ErrorObject => {
  const data = getData();

  const userIndex = data.tokens.findIndex(tokens => tokens.token.includes(token));

  if (token === '' || userIndex === -1) {
    throw HTTPError(401, 'Token is empty or invalid');
  }

  const userId = data.tokens[userIndex].userId;
  console.log(userId);
  const quizIndex = data.quizzes.findIndex(quizzes => quizzes.quizId === quizId);

  // Check if quiz is in the data
  if (quizIndex === -1) {
    throw HTTPError(403, 'QuizId invalid');
  }

  // Check if user owns quiz
  if (data.quizzes[quizIndex].creatorId !== userId) {
    throw HTTPError(403, 'User does not own the quiz');
  }

  const quizInfo = {

    quizId: data.quizzes[quizIndex].quizId,
    name: data.quizzes[quizIndex].name,
    timeCreated: data.quizzes[quizIndex].timeCreated,
    timeLastEdited: data.quizzes[quizIndex].timeLastEdited,
    description: data.quizzes[quizIndex].description,
    numQuestions: data.quizzes[quizIndex].numQuestions,
    questions: data.quizzes[quizIndex].questions,
    duration: data.quizzes[quizIndex].duration,
    thumbnailUrl: data.quizzes[quizIndex].thumbnail,
  };

  return quizInfo;
};

/**
Update the name of the relevant quiz
* @param {string} token - session id of the user who owns quiz
* @param {int} quizId - id of the quiz that needs to be updated
* @param {string} name - new name for the quiz
* @returns {} - when function successfully updates name
* @returns {error: (string)} - when there is an error with the inputs
*/
export const adminQuizNameUpdate = (token: string, quizId: number, name: string): Empty | ErrorObject => {
  const data = getData();

  const userIndex = data.tokens.findIndex(tokens => tokens.token.includes(token));

  if (token === '' || userIndex === -1) {
    throw HTTPError(401, 'Token is empty or invalid');
  }

  const userId = data.tokens[userIndex].userId;

  const quizIndex = data.quizzes.findIndex(quizzes => quizzes.quizId === quizId);

  // Check if quiz is in the data
  if (quizIndex === -1) {
    throw HTTPError(403, 'QuizId invalid');
  }

  // Check if user owns quiz
  if (data.quizzes[quizIndex].creatorId !== userId) {
    throw HTTPError(403, 'User does not own the quiz');
  }

  if (name.length > 30 || name.length < 3) {
    throw HTTPError(400, 'Name must be greater than 3 characters and less than 30');
  }

  const regex = /[^A-Za-z0-9\s]/;
  if (regex.test(name)) {
    throw HTTPError(400, 'Name cannot contain special characters');
  }

  if (data.quizzes.some(quizzes => quizzes.name === name) && data.quizzes.some(quizzes => quizzes.creatorId === userId)) {
    throw HTTPError(400, 'Name is taken by another quiz owned by user');
  }

  data.quizzes[quizIndex].name = name;
  data.quizzes[quizIndex].timeLastEdited = Math.floor(Date.now() / 1000);
  saveData(data);
  return {};
};

export const adminQuizNameUpdateV2 = (quizid: number, token: string, newName: string): Empty | ErrorObject => {
  const data = getData();

  if (token === '') {
    throw HTTPError(401, '400 - Token empty or invalid');
  }

  const userIndex = data.tokens.findIndex(tokens => tokens.token === token);

  if (userIndex === -1) {
    throw HTTPError(401, '400 - Token empty or invalid');
  }

  const userid = data.tokens[userIndex].userId;
  const ownQuizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizid && quiz.creatorId === userid);

  if (ownQuizIndex === -1) {
    throw HTTPError(403, '403 - Valid token but user does not own quiz');
  }

  const isNameUsed = data.quizzes.findIndex(quiz => quiz.name === newName && quiz.creatorId === userid);

  if (isNameUsed !== -1) {
    throw HTTPError(400, '400 - Name is already used in one one your quizzes');
  }

  const invalidNamePattern = /[^A-Za-z0-9\s]/;

  if (invalidNamePattern.test(newName)) {
    throw HTTPError(400, '400 - Invalid characters');
  }

  if (newName.length < 3 || newName.length > 30) {
    throw HTTPError(400, '400 - Invalid name length');
  }

  const quizIndex = data.quizzes.findIndex(quizzes => quizzes.quizId === quizid);

  data.quizzes[quizIndex].name = newName;
  data.quizzes[quizIndex].timeLastEdited = Math.floor(Date.now() / 1000);
  saveData(data);
  return {};
};

/**
* Update the description of the relevant quiz.
* @param {string} token - session id of the user who owns quiz
* @param {int} quizId - id of the quiz that needs to be updated
* @param {string} description - new description for the quiz
* @returns {} - when function successfully updates name
* @returns {error: (string)} - when there is an error with the inputs
*/
export const adminQuizDescriptionUpdate = (token: string, quizId: number, description: string): Empty | ErrorObject => {
  const data = getData();

  const userIndex = data.tokens.findIndex(tokens => tokens.token.includes(token));

  if (token === '' || userIndex === -1) {
    throw HTTPError(401, 'Token is empty or invalid');
  }

  const userId = data.tokens[userIndex].userId;

  const quizIndex = data.quizzes.findIndex(quizzes => quizzes.quizId === quizId);

  // Check if quiz is in the data
  if (quizIndex === -1) {
    throw HTTPError(403, 'QuizId invalid');
  }

  // Check if user owns quiz
  if (data.quizzes[quizIndex].creatorId !== userId) {
    throw HTTPError(403, 'User does not own the quiz');
  }

  if (description.length > 100) {
    throw HTTPError(400, 'Description must be less than 100 characters');
  }
  // Get quiz index and change the description and timeLastEdited

  data.quizzes[quizIndex].description = description;
  data.quizzes[quizIndex].timeLastEdited = Math.floor(Date.now() / 1000);
  saveData(data);
  return {};
};

export const adminQuizDescriptionUpdateV2 = (quizId: number, token: string, description: string): Empty | ErrorObject => {
  const data = getData();

  if (!token) {
    throw HTTPError(401, '401 - Token empty or invalid');
  }

  const userIndex = data.tokens.findIndex(tokens => tokens.token === token);

  if (userIndex === -1) {
    throw HTTPError(401, '401 - Token empty or invalid');
  }

  if (description.length > 100) {
    throw HTTPError(400, '400 - Description is too long');
  }

  const userid = data.tokens[userIndex].userId;
  const ownQuizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId && quiz.creatorId === userid);

  if (ownQuizIndex === -1) {
    throw HTTPError(403, '403 - Valid token but user does not own quiz');
  }

  const quizIndex = data.quizzes.findIndex(quizzes => quizzes.quizId === quizId);

  data.quizzes[quizIndex].description = description;
  data.quizzes[quizIndex].timeLastEdited = Math.floor(Date.now() / 1000);
  saveData(data);
  return {};
};

export const trashQuiz = (quizId: number, token: string): Empty | ErrorObject => {
  const data = getData();

  const userIndex = data.tokens.findIndex(index => index.token === token);
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  if (userIndex === -1) {
    throw HTTPError(401, '401 - Invalid token');
  }
  const userId = data.tokens[userIndex].userId;
  if (quizIndex === -1) {
    throw HTTPError(403, '403 - Invalid quizId');
  }

  if (data.quizzes[quizIndex].creatorId !== userId) {
    throw HTTPError(403, '403 - Invalid quizId');
  }
  // Any session for this quiz is not in END state
  if (data.sessions.some(session => session.metaData.quizId === quizId && session.state !== 'END')) {
    throw HTTPError(400, '400 - Quiz is used in active session');
  }

  // Move the quiz to trash, add trash key to
  const trashedQuiz = data.quizzes[quizIndex];
  trashedQuiz.timeLastEdited = Math.floor(Date.now() / 1000);
  data.quizzes.splice(quizIndex, 1);
  data.trash.push(trashedQuiz);
  saveData(data);

  return {};
};

export const trashQuizList = (token: string): QuizListReturn | ErrorObject => {
  const data = getData();

  const userIndex = data.tokens.findIndex(index => index.token === token);
  if (userIndex === -1) {
    throw HTTPError(401, '401 - Invalid token');
  }

  const trashArray = [];
  for (const quiz of data.trash) {
    if (quiz.creatorId === data.tokens[userIndex].userId) {
      trashArray.push({ quizId: quiz.quizId, name: quiz.name });
    }
  }

  return { quizzes: trashArray };
};

export const trashRestore = (quizId: number, token: string): Empty | ErrorObject => {
  const data = getData();
  const trashIndex = data.trash.findIndex(trash => trash.quizId === quizId);
  const userIndex = data.tokens.findIndex(index => index.token === token);

  // Errors
  if (userIndex === -1) {
    throw HTTPError(401, 'Invalid token');
  }

  const userId = data.tokens[userIndex].userId;

  if (trashIndex === -1) {
    if (data.quizzes.some(quiz => quiz.quizId === quizId)) {
      throw HTTPError(400, 'Quiz is not in trash');
    }
    throw HTTPError(403, '403 - Invalid quizId');
  }

  if (data.trash[trashIndex].creatorId !== userId) { // 403
    throw HTTPError(403, '403 - Invalid quizId');
  }

  if (data.quizzes.some(quiz => quiz.name === data.trash[trashIndex].name && quiz.creatorId === userId)) {
    throw HTTPError(400, 'Name of trashed quiz is taken');
  }

  const restoredQuiz = data.trash[trashIndex];
  restoredQuiz.timeLastEdited = Math.floor(Date.now() / 1000);
  data.trash.splice(trashIndex, 1);
  data.quizzes.push(restoredQuiz);
  saveData(data);

  return {};
};

export const trashEmpty = (token: string, quizIds: number[]): Empty | ErrorObject => {
  const data = getData();
  const userIndex = data.tokens.findIndex(index => index.token === token);

  // Errors
  if (userIndex === -1) {
    throw HTTPError(401, '401 - Invalid token');
  }
  const userId = data.tokens[userIndex].userId;

  for (const quizId of quizIds) {
    const trashIndex = data.trash.findIndex(trash => trash.quizId === quizId);
    if (trashIndex === -1) {
      if (data.quizzes.some(quiz => quiz.quizId === quizId)) {
        throw HTTPError(400, '400 - Quiz is not in trash');
      }
    } else if (data.trash[trashIndex].creatorId !== userId) {
      throw HTTPError(403, '403 - Invalid quizId');
    }
  }
  // Implementation
  for (const quizId of quizIds) {
    const trashIndex = data.trash.findIndex(trash => trash.quizId === quizId);
    data.trash.splice(trashIndex, 1);
  }
  saveData(data);

  return {};
};

export const updateQuestion = (quizId: number, questionId: number, token: string, questionBody: QuestionBody): Empty | ErrorObject => {
  const data = getData();
  const userIndex = data.tokens.findIndex(index => index.token === token);
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);

  // Errors
  if (userIndex === -1) { // 401
    return { error: '401 - Invalid token' };
  }
  const userId = data.tokens[userIndex].userId;

  if (quizIndex === -1) { // 403
    return { error: '403 - Invalid quizId' };
  }

  if (data.quizzes[quizIndex].creatorId !== userId) { // 403
    return { error: '403 - Invalid quizId' };
  }

  // 400 errors
  const questionIndex = data.quizzes[quizIndex].questions.findIndex(question => question.questionId === questionId);
  if (questionIndex === -1) { // C
    return { error: '400 - Invalid questionId' };
  }

  if (questionBody.question.length < 5 || questionBody.question.length > 50) { // C
    return { error: '400 - Invalid question length' };
  }

  if (questionBody.answers.length < 2 || questionBody.answers.length > 6) { // C
    return { error: '400 - Invalid number of answers' };
  }

  if (questionBody.duration <= 0) { // C
    return { error: '400 - Invalid duration' };
  }

  const quiz = data.quizzes[quizIndex]; // C
  const newDuration = quiz.duration - quiz.questions[questionIndex].duration + questionBody.duration;
  if (newDuration > 180) {
    return { error: '400 - Invalid duration' };
  }

  if (questionBody.points < 1 || questionBody.points > 10) { // C
    return { error: '400 - Invalid points' };
  }

  if (questionBody.answers.some(answer => answer.answer.length < 1 || answer.answer.length > 30)) { // C
    return { error: '400 - Answer string too long or to short' };
  }

  if ((new Set(questionBody.answers.map(answer => answer.answer))).size !== questionBody.answers.length) { // C
    return { error: '400 - Duplicate answer strings found' };
  }

  if (!questionBody.answers.some(answer => answer.correct === true)) { // C
    return { error: '400 - There are no correct answers' };
  }

  // Logic
  const newAnswers = [];
  for (const answer of questionBody.answers) {
    const max = 10000;
    let newAnswerId: number;

    do {
      newAnswerId = Math.floor(Math.random() * max);
    } while (data.quizzes.some(quizzes => quizzes.questions.some(question => question.answers.some(answer => answer.answerId === newAnswerId))) ||
            newAnswers.some(answer => answer.answerId === newAnswerId));

    newAnswers.push({
      answerId: newAnswerId,
      answer: answer.answer,
      correct: answer.correct,
    });
  }

  const updatedQuestion = {
    questionId: questionId,
    question: questionBody.question,
    duration: newDuration,
    points: questionBody.points,
    answers: newAnswers,
  };

  getRandomColour(updatedQuestion.answers);
  data.quizzes[quizIndex].questions[questionIndex] = updatedQuestion;
  data.quizzes[quizIndex].timeLastEdited = Math.floor(Date.now() / 1000);
  data.quizzes[quizIndex].duration = newDuration;
  saveData(data);

  return {};
};

export const updateQuestionV2 = (quizId: number, questionId: number, token: string, questionBody: QuestionBody): Empty | ErrorObject => {
  const data = getData();
  const userIndex = data.tokens.findIndex(index => index.token === token);
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);

  // Errors
  if (userIndex === -1) { // 401
    throw HTTPError(401, 'Invalid token');
  }
  const userId = data.tokens[userIndex].userId;

  if (quizIndex === -1) { // 403
    throw HTTPError(403, 'Invalid quizId');
  }

  if (data.quizzes[quizIndex].creatorId !== userId) { // 403
    throw HTTPError(403, 'Invalid quizId');
  }

  // 400 errors
  const questionIndex = data.quizzes[quizIndex].questions.findIndex(question => question.questionId === questionId);
  if (questionIndex === -1) { // C
    throw HTTPError(400, 'Invalid questionId');
  }

  if (questionBody.question.length < 5 || questionBody.question.length > 50) { // C
    throw HTTPError(400, 'Invalid question length');
  }

  if (questionBody.answers.length < 2 || questionBody.answers.length > 6) { // C
    throw HTTPError(400, 'Invalid number of answers');
  }

  if (questionBody.duration <= 0) { // C
    throw HTTPError(400, 'Invalid duration');
  }

  const quiz = data.quizzes[quizIndex]; // C
  const newDuration = quiz.duration - quiz.questions[questionIndex].duration + questionBody.duration;
  if (newDuration > 180) {
    throw HTTPError(400, 'Invalid duration');
  }

  if (questionBody.points < 1 || questionBody.points > 10) { // C
    throw HTTPError(400, 'Invalid points');
  }

  if (questionBody.answers.some(answer => answer.answer.length < 1 || answer.answer.length > 30)) { // C
    throw HTTPError(400, 'Answer string too long or to short');
  }

  if ((new Set(questionBody.answers.map(answer => answer.answer))).size !== questionBody.answers.length) { // C
    throw HTTPError(400, 'Duplicate answer strings found');
  }

  if (!questionBody.answers.some(answer => answer.correct === true)) { // C
    throw HTTPError(400, 'There are no correct answers');
  }

  if (questionBody.thumbnailUrl === '' || validateThumbnailUrl(questionBody.thumbnailUrl) === false) {
    throw HTTPError(400, '400 - Invalid thumbnailUrl');
  }

  // Logic
  const newAnswers = [];
  for (const answer of questionBody.answers) {
    const max = 10000;
    let newAnswerId: number;

    do {
      newAnswerId = Math.floor(Math.random() * max);
    } while (data.quizzes.some(quizzes => quizzes.questions.some(question => question.answers.some(answer => answer.answerId === newAnswerId))) ||
            newAnswers.some(answer => answer.answerId === newAnswerId));

    newAnswers.push({
      answerId: newAnswerId,
      answer: answer.answer,
      correct: answer.correct,
    });
  }

  const updatedQuestion = {
    questionId: questionId,
    question: questionBody.question,
    duration: newDuration,
    thumbnailUrl: questionBody.thumbnailUrl,
    points: questionBody.points,
    answers: newAnswers,
  };

  getRandomColour(updatedQuestion.answers);

  data.quizzes[quizIndex].questions[questionIndex] = updatedQuestion;
  data.quizzes[quizIndex].timeLastEdited = Math.floor(Date.now() / 1000);
  data.quizzes[quizIndex].duration = newDuration;
  saveData(data);

  return {};
};

export const questionDuplicate = (quizId: number, questionId: number, token: string): NewQuizQuestionIdReturn | ErrorObject => {
  const data = getData();

  if (token === '') {
    throw HTTPError(401, '401 - Token is empty');
  }

  const check1 = data.quizzes.find(quiz => quiz.quizId === quizId);

  if (check1 === undefined) {
    throw HTTPError(403, '403 - Invalid quizId');
  }

  const check2 = check1.questions.find(question => question.questionId === questionId);
  if (check2 === undefined) {
    throw HTTPError(400, '400 - quiz does not contain questionId');
  }

  const check3 = data.tokens.find((tokens) => tokens.token === token);
  if (check3 === undefined) {
    throw HTTPError(401, '401 - Invalid token');
  }

  if (check1.creatorId !== check3.userId) {
    throw HTTPError(403, '403 - quiz does not belong to user');
  }

  const newQuestion: Questions = {
    ...check2,
    answers: check2.answers.map((answer: Answers) => ({ ...answer }))
  };

  let questionIdnew;
  const max = 10000;

  do {
    questionIdnew = Math.floor(Math.random() * max);
  } while (data.quizzes.some(quizzes => quizzes.questions.some(question => question.questionId === questionIdnew)));
  newQuestion.questionId = questionIdnew;

  check1.questions.push(newQuestion);

  saveData(data);

  return { newQuestionId: newQuestion.questionId };
};

export const createQuizQuestion = (token: string, quizId: number, questionCreated: Questions): QuizQuestionIdReturn | ErrorObject => {
  const data = getData(); // Assuming this fetches your current data state
  const userIndex = data.tokens.findIndex((tokenObj) => tokenObj.token === token);

  if (userIndex === -1 || token === '') {
    return { error: '401 - Invalid token' };
  }

  const userId = data.tokens[userIndex].userId;
  const quizIndex = data.quizzes.findIndex((q) => q.quizId === quizId);

  if (quizIndex === -1) {
    return { error: '403 - Invalid quizId' };
  }

  const quiz = data.quizzes[quizIndex];

  if (quiz.creatorId !== userId) {
    return { error: '403 - Not the quiz owner' };
  }

  // Validate question details
  if (questionCreated.question.length < 5 || questionCreated.question.length > 50) {
    return { error: '400 - Invalid question length' };
  }

  if (questionCreated.answers.length < 2 || questionCreated.answers.length > 6) {
    return { error: '400 - Invalid number of answers' };
  }

  if (questionCreated.duration <= 0 || (quiz.questions.reduce((acc, curr) => acc + curr.duration, 0) + questionCreated.duration > 180)) {
    return { error: '400 - Invalid duration' };
  }

  if (questionCreated.points < 1 || questionCreated.points > 10) {
    return { error: '400 - Invalid points' };
  }

  const hasInvalidAnswer = questionCreated.answers.some(answer =>
    answer.answer.length < 1 || answer.answer.length > 30
  );

  if (hasInvalidAnswer) {
    return { error: '400 - Invalid answer length' };
  }

  const answerTexts = questionCreated.answers.map(answer => answer.answer);
  const uniqueAnswers = new Set(answerTexts);
  if (uniqueAnswers.size !== questionCreated.answers.length) {
    return { error: '400 - Duplicate answer strings found' };
  }

  const hasCorrectAnswer = questionCreated.answers.some(answer => answer.correct);
  if (!hasCorrectAnswer) {
    return { error: '400 - There are no correct answers' };
  }

  const max = 10000;
  let questionIdnew: number;

  do {
    questionIdnew = Math.floor(Math.random() * max);
  } while (data.quizzes.some(quizzes => quizzes.questions.some(question => question.questionId === questionIdnew)));

  const newAnswers = [];
  for (const answer of questionCreated.answers) {
    const max = 10000;
    let newAnswerId: number;

    do {
      newAnswerId = Math.floor(Math.random() * max);
    } while (data.quizzes.some(quizzes => quizzes.questions.some(question => question.answers.some(answer => answer.answerId === newAnswerId))) ||
            newAnswers.some(answer => answer.answerId === newAnswerId));

    newAnswers.push({
      answerId: newAnswerId,
      answer: answer.answer,
      correct: answer.correct,
    });
  }

  const newQuestion: Questions = {
    questionId: questionIdnew,
    question: questionCreated.question,
    duration: questionCreated.duration,
    points: questionCreated.points,
    answers: newAnswers,
  };

  getRandomColour(newQuestion.answers);

  data.quizzes[quizIndex].questions.push(newQuestion);
  data.quizzes[quizIndex].duration = questionCreated.duration + data.quizzes[quizIndex].duration;
  data.quizzes[quizIndex].numQuestions = data.quizzes[quizIndex].numQuestions + 1;
  data.quizzes[quizIndex].timeLastEdited = Math.floor(Date.now() / 1000);

  saveData(data);

  return { questionId: newQuestion.questionId };
};

/*
function getRandomColour(): string {
  const letters = '0123456789ABCDEF';
  let colour = '#';
  for (let i = 0; i < 6; i++) {
    colour += letters[Math.floor(Math.random() * 16)];
  }
  return colour;
}
*/

export const createQuizQuestionV2 = (token: string, quizId: number, questionCreated: QuestionsV2): QuizQuestionIdReturn | ErrorObject => {
  const data = getData(); // Assuming this fetches your current data state

  // Find the quizId given token
  const userIndex = data.tokens.findIndex((tokenObj) => tokenObj.token === token);

  if (userIndex === -1 || token === '') {
    throw HTTPError(401, '401 - Invalid token');
  }

  const userId = data.tokens[userIndex].userId;
  const quizIndex = data.quizzes.findIndex((q) => q.quizId === quizId);

  if (quizIndex === -1) {
    throw HTTPError(403, '403 - Invalid quizId');
  }

  const quiz = data.quizzes[quizIndex];

  if (quiz.creatorId !== userId) {
    throw HTTPError(403, '403 - user does not own quiz');
  }

  // Validate question details
  if (questionCreated.question.length < 5 || questionCreated.question.length > 50) {
    throw HTTPError(400, '400 - Invalid question length');
  }

  if (questionCreated.answers.length < 2 || questionCreated.answers.length > 6) {
    throw HTTPError(400, '400 - Invalid number of answers');
  }
  if (questionCreated.duration <= 0 || (quiz.questions.reduce((acc, curr) => acc + curr.duration, 0) + questionCreated.duration > 180)) {
    throw HTTPError(400, '400 - Invalid duration');
  }

  if (questionCreated.points < 1 || questionCreated.points > 10) {
    throw HTTPError(400, '400 - Invalid points');
  }

  if (questionCreated.thumbnailUrl === '' || validateThumbnailUrl(questionCreated.thumbnailUrl) === false) {
    throw HTTPError(400, '400 - Invalid thumbnailUrl');
  }

  const hasInvalidAnswer = questionCreated.answers.some(answer =>
    answer.answer.length < 1 || answer.answer.length > 30
  );

  if (hasInvalidAnswer) {
    throw HTTPError(400, '400 - Invalid answer length');
  }

  const answerTexts = questionCreated.answers.map(answer => answer.answer);
  const uniqueAnswers = new Set(answerTexts);
  if (uniqueAnswers.size !== questionCreated.answers.length) {
    throw HTTPError(400, '400 - Duplicate answer strings found');
  }

  const hasCorrectAnswer = questionCreated.answers.some(answer => answer.correct);
  if (!hasCorrectAnswer) {
    throw HTTPError(400, '400 - There are no correct answers');
  }

  const max = 10000;
  let questionIdnew: number;

  do {
    questionIdnew = Math.floor(Math.random() * max);
  } while (data.quizzes.some(quizzes => quizzes.questions.some(question => question.questionId === questionIdnew)));

  const newAnswers = [];
  for (const answer of questionCreated.answers) {
    const max = 10000;
    let newAnswerId: number;

    do {
      newAnswerId = Math.floor(Math.random() * max);
    } while (data.quizzes.some(quizzes => quizzes.questions.some(question => question.answers.some(answer => answer.answerId === newAnswerId))) ||
            newAnswers.some(answer => answer.answerId === newAnswerId));

    newAnswers.push({
      answerId: newAnswerId,
      answer: answer.answer,
      correct: answer.correct,
    });
  }

  const newQuestion: Questions = {
    questionId: questionIdnew,
    question: questionCreated.question,
    duration: questionCreated.duration,
    thumbnailUrl: questionCreated.thumbnailUrl,
    points: questionCreated.points,
    answers: newAnswers,
  };

  getRandomColour(newQuestion.answers);

  data.quizzes[quizIndex].questions.push(newQuestion);
  data.quizzes[quizIndex].duration = questionCreated.duration + data.quizzes[quizIndex].duration;
  data.quizzes[quizIndex].numQuestions = data.quizzes[quizIndex].numQuestions + 1;
  data.quizzes[quizIndex].timeLastEdited = Math.floor(Date.now() / 1000);

  saveData(data);

  return { questionId: newQuestion.questionId };
};

function validateThumbnailUrl(url): boolean {
  const startsWithHttp = /^https?:\/\//i.test(url);
  const endsWithValidExtension = /\.(jpg|jpeg|png)$/i.test(url);

  if (!startsWithHttp) {
    throw HTTPError(400, 'URL must start with "http://" or "https://"');
  }
  if (!endsWithValidExtension) {
    throw HTTPError(400, 'URL must end with one of the following extensions: .jpg, .jpeg, .png');
  }
  return true;
}

/**
 *
 * @param token
 * @param userEmail
 * @param quizIdTransfer
 * @returns
 */
export const adminQuizTransfer = (userToken: string, userEmail: string, quizIdTransfer: number): Empty | ErrorObject => {
  const data = getData();

  if (!data.tokens.some(tokens => tokens.token === userToken) || userToken === '') {
    throw HTTPError(401, 'Invalid token');
  }

  const userTokenIndex = data.tokens.findIndex(tokens => tokens.token === userToken);
  const userId = data.tokens[userTokenIndex].userId;
  const userIndex = data.users.findIndex(user => user.userId === userId);
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizIdTransfer);

  if (quizIndex === -1) {
    throw HTTPError(403, 'Invalid quizId');
  }

  if (data.quizzes[quizIndex].creatorId !== userId) {
    throw HTTPError(403, 'Invalid quizId');
  }

  if (!data.users.some(users => users.email === userEmail)) {
    throw HTTPError(400, 'Invalid email');
  }

  const ownerEmail = data.users[userIndex].email;

  if (ownerEmail === userEmail) {
    throw HTTPError(400, 'Invalid email');
  }

  if (data.sessions.some(session => session.metaData.quizId === quizIdTransfer && session.state !== 'END')) {
    throw HTTPError(400, 'Sessions for quiz not in END state');
  }

  const targetUserIndex = data.users.findIndex(users => users.email === userEmail);

  const transferringQuizIndex = data.quizzes.findIndex(quizzes => quizzes.quizId === quizIdTransfer);
  const quizName = data.quizzes[transferringQuizIndex].name;
  const targetUserQuizzesArray = data.quizzes.filter(quizzes => quizzes.creatorId === targetUserIndex);
  if (targetUserQuizzesArray.some(quizzes => quizzes.name === quizName)) {
    throw HTTPError(400, 'Other user already has quiz with the same name');
  }

  data.quizzes[transferringQuizIndex].creatorId = targetUserIndex;
  data.users[targetUserIndex].quizId.push(quizIdTransfer);

  // Remove the transferred quiz from the original user's quiz list
  data.users[userIndex].quizId = data.users[userIndex].quizId.filter((quizId) => quizId !== quizIdTransfer);
  saveData(data);

  return {};
};

/**
* Delete a question from the relevant quiz
* @param {int} quizId - id of the quiz that holds the question
* @param {int} questionId - id of the question that needs to be deleted
* @param {string} questionId - id for a user session
* @returns {} - when function successfully updates name
* @returns {error: (string)} - when there is an error with the inputs
*/
export const adminQuizQuestionDelete = (quizId: number, questionId: number, token: string, versionTwo: boolean): Empty | ErrorObject => {
  const data = getData();

  const index = data.tokens.findIndex((tokenObj) => tokenObj.token === token);

  // check if token is located in the database
  if (index === -1) {
    throw HTTPError(401, 'Token does not refer to valid logged in user session');
  }

  // Find what user the token is for
  const userId = data.tokens[index].userId;

  const quizIndex = data.quizzes.findIndex(quizzes => quizzes.quizId === quizId);

  // Check if quiz is in the data
  if (quizIndex === -1) {
    throw HTTPError(403, 'QuizId invalid');
  }

  // Check if user owns quiz
  if (data.quizzes[quizIndex].creatorId !== userId) {
    throw HTTPError(403, 'User does not own the quiz');
  }

  // Check if question is located in quiz
  const questionIndex = data.quizzes[quizIndex].questions.findIndex(questions => questions.questionId === questionId);

  if (questionIndex === -1) {
    throw HTTPError(400, 'Question Id does not refer to a valid question within this quiz');
  }

  const sessions = findSessions(quizId);

  if (versionTwo === true) {
    for (const session of sessions) {
      if (session.state !== 'END') {
        throw HTTPError(400, 'Any session for this quiz is not in END state');
      }
    }
  }

  // Delete given question
  data.quizzes[quizIndex].questions.splice(questionIndex, 1);

  const duration = data.quizzes[quizIndex].questions.reduce((accumulator, currentValue) => accumulator + currentValue.duration, 0);

  data.quizzes[quizIndex].duration = duration;
  data.quizzes[quizIndex].numQuestions = data.quizzes[quizIndex].questions.length;

  saveData(data);

  return {};
};

/**
* Update the description of the relevant quiz.
* @param {string} token - session id of the user who owns quiz
* @param {int} quizId - id of the quiz that needs to be updated
* @param {int} questionId - question that will be moved
*  @param {int} newPosition - position where question will be moved too
* @returns {} - when function successfully updates name
* @returns {error: (string)} - when there is an error with the inputs
*/
export const adminQuizQuestionMove = (quizId: number, questionId: number, token: string, newPosition: number): Empty | ErrorObject => {
  const data = getData();
  const minPosition = 0;

  const index = data.tokens.findIndex((tokenObj) => tokenObj.token === token);

  // check if token is located in the database
  if (index === -1) {
    throw HTTPError(401, 'Token does not refer to valid logged in user session');
  }

  // Find what user the token is for
  const userId = data.tokens[index].userId;

  const quizIndex = data.quizzes.findIndex(quizzes => quizzes.quizId === quizId);

  // Check if quiz is in the data
  if (quizIndex === -1) {
    throw HTTPError(403, 'QuizId invalid');
  }

  // Check if user owns quiz
  if (data.quizzes[quizIndex].creatorId !== userId) {
    throw HTTPError(403, 'User does not own the quiz');
  }

  // Check if question is located in quiz
  const questionIndex = data.quizzes[quizIndex].questions.findIndex(questions => questions.questionId === questionId);

  if (questionIndex === -1) {
    throw HTTPError(400, 'Question Id does not refer to a valid question within this quiz');
  }

  // Check errors for newPosition
  if (newPosition < minPosition) {
    throw HTTPError(400, 'new position is less than 0');
  } else if (newPosition > (data.quizzes[quizIndex].questions.length - 1)) {
    throw HTTPError(400, 'new position is greater than question length');
  } else if (newPosition === questionIndex) {
    throw HTTPError(400, 'new position is in the current position');
  }

  // Move the question and update time last edited
  data.quizzes[quizIndex].questions.splice(newPosition, 0, data.quizzes[quizIndex].questions.splice(questionIndex, 1)[0]);
  data.quizzes[quizIndex].timeLastEdited = Math.floor(Date.now() / 1000);

  saveData(data);
  return {};
};

/**
* Update the description of the relevant quiz.
* @param {int} quizId - id of the quiz that needs to be updated
* * @param {string} token - session id of the user who owns quiz
* @param {string} imgUrl - url that will be used for thumbnail
* @returns {} - when function successfully updates quiz thumbnail
* @returns {error: (string)} - when there is an error with the inputs
*/
export const adminQuizThumbnailUpdate = (quizId: number, token: string, imgUrl: string): Empty | ErrorObject => {
  const data = getData();

  const index = data.tokens.findIndex((tokenObj) => tokenObj.token === token);

  // check if token is located in the database
  if (index === -1) {
    throw HTTPError(401, 'Token does not refer to valid logged in user session');
  }

  // Find what user the token is for
  const userId = data.tokens[index].userId;

  const quizIndex = data.quizzes.findIndex(quizzes => quizzes.quizId === quizId);

  // Check if quiz is in the data
  if (quizIndex === -1) {
    throw HTTPError(403, 'QuizId invalid');
  }

  // Check if user owns quiz
  if (data.quizzes[quizIndex].creatorId !== userId) {
    throw HTTPError(403, 'User does not own the quiz');
  }

  imgUrl = imgUrl.toLowerCase();

  if (!validImgUrl(imgUrl)) {
    throw HTTPError(400, 'thumbnail is invalid');
  }

  data.quizzes[quizIndex].thumbnail = imgUrl;
  data.quizzes[quizIndex].timeLastEdited = Math.floor(Date.now() / 1000);

  saveData(data);
  return {};
};
