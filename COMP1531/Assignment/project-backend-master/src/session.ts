import {
  getData,
  saveData
} from './dataStore';
import {
  Session,
  SessionStartReturn,
  ACTION,
  QuizSessionStatus,
  Empty,
  Player,
  sessionsView,
  Message,
  playerQuestionView,
  SessionResults,
  QuestionAnswers,
  PlayerStatus
} from './interface';
import {
  actionNextQuestion,
  setStateQuestionOpen,
  actionEnd,
  actionGoToAnswer,
  actionGoToFinalResults,
  findSessions,
  getUsersRankedByScore,
  getQuestionResults,
} from './helper';
import HTTPError from 'http-errors';

export const correctAnswers = (player: Player, answers: number[], position: number): boolean => {
  const playerAnswer = [];
  for (let index = 0; player.questionScores[position].answerIds.length > index; index++) {
    playerAnswer.push(player.questionScores[position].answerIds[index]);
  }
  if (playerAnswer.length !== answers.length) {
    return false;
  }

  const sortedplayer = playerAnswer.sort();
  const sortedanswers = answers.sort();

  for (let i = 0; i < sortedplayer.length; i++) {
    if (sortedplayer[i] !== sortedanswers[i]) {
      return false;
    }
  }
  return true;
};

export const adminSessionStart = (userToken: string, autoStartNum: number, quizId: number): SessionStartReturn => {
  const data = getData();

  const userIndex = data.tokens.findIndex(index => index.token.includes(userToken));
  if (userIndex === -1 || userToken === '') {
    throw HTTPError(401, 'Invalid token');
  }

  if ((!data.trash.some(quiz => quiz.quizId === quizId) && !data.quizzes.some(quizzes => quizzes.quizId === quizId)) || !data.users[userIndex].quizId.some(quizzId => quizzId === quizId)) {
    throw HTTPError(403, 'Invalid quizId');
  }

  if (data.trash.some(quiz => quiz.quizId === quizId)) {
    throw HTTPError(400, 'Quiz in trash');
  }

  const maximumPlayerAuto = 50;
  if (autoStartNum > maximumPlayerAuto) {
    throw HTTPError(400, 'autoStartNum greater than 50');
  }

  const quizSessions = data.sessions.filter(session => session.metaData.quizId === quizId);
  const activeQuizSessions = quizSessions.filter(session => session.state !== 'END');
  if (activeQuizSessions.length > 10) {
    throw HTTPError(400, 'Maximum of only 10 sessions per quiz');
  }

  const quizIndex = data.quizzes.findIndex(quizzes => quizzes.quizId === quizId);
  if (data.quizzes[quizIndex].questions.length === 0) {
    throw HTTPError(400, 'Quiz does not have any questions');
  }

  const max = 10000;
  let newSessionId: number;

  do {
    newSessionId = Math.floor(Math.random() * max);
  } while (data.sessions.some(session => session.sessionId === newSessionId));

  const newSession: Session = {
    sessionId: newSessionId,
    metaData: data.quizzes[quizIndex],
    players: [],
    atQuestion: 0,
    questionStartTime: 0,
    state: 'LOBBY',
    messages: [],
    autoStartNum: autoStartNum
  };

  data.sessions.push(newSession);
  saveData(data);

  return { sessionId: newSessionId };
};

export const getQuizSessionStatus = (token: string, quizId: number, sessionId: number): QuizSessionStatus => {
  const data = getData();
  // Errors
  const userIndex = data.tokens.findIndex(index => index.token.includes(token));
  if (userIndex === -1 || token === '') {
    throw HTTPError(401, 'Invalid token');
  }
  const userId = data.tokens[userIndex].userId;

  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  if (quizIndex === -1) {
    throw HTTPError(403, 'Invalid quizId');
  }

  if (data.quizzes[quizIndex].creatorId !== userId) {
    throw HTTPError(403, 'User does not own quiz');
  }

  const sessionIndex = data.sessions.findIndex(session => session.sessionId === sessionId);
  if (sessionIndex === -1 || data.sessions[sessionIndex].metaData.quizId !== quizId) {
    throw HTTPError(400, 'Invalid sessionId');
  }

  const targetSession = data.sessions[sessionIndex];

  // Function Logic
  const playerArray = [];
  for (const player of targetSession.players) {
    playerArray.push(player.playerName);
  }

  const questionArray = [];
  for (const question of targetSession.metaData.questions) {
    const newQuestion = {
      questionId: question.questionId,
      question: question.question,
      duration: question.duration,
      thumbnailUrl: question.thumbnailUrl,
      points: question.points,
      answers: question.answers
    };
    questionArray.push(newQuestion);
  }

  const statusReturn = {
    state: targetSession.state,
    atQuestion: targetSession.atQuestion,
    players: playerArray,
    metadata: {
      quizId: targetSession.metaData.quizId,
      name: targetSession.metaData.name,
      timeCreated: targetSession.metaData.timeCreated,
      timeLastEdited: targetSession.metaData.timeLastEdited,
      description: targetSession.metaData.description,
      numQuestions: targetSession.metaData.numQuestions,
      questions: questionArray,
      duration: targetSession.metaData.duration,
      thumbnailUrl: targetSession.metaData.thumbnail
    }
  };
  return statusReturn;
};

export const updateSessionState = (token: string, quizId: number, sessionId: number, action: ACTION): Empty => {
  const data = getData();
  // Errors
  const userIndex = data.tokens.findIndex(index => index.token.includes(token));
  if (userIndex === -1 || token === '') {
    throw HTTPError(401, 'Invalid token');
  }
  const userId = data.tokens[userIndex].userId;

  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  if (quizIndex === -1) {
    throw HTTPError(403, 'Invalid quizId');
  }

  if (data.quizzes[quizIndex].creatorId !== userId) {
    throw HTTPError(403, 'User does not own quiz');
  }

  const sessionIndex = data.sessions.findIndex(session => session.sessionId === sessionId);
  if (sessionIndex === -1) {
    throw HTTPError(400, 'Invalid sessionId');
  }

  if (data.sessions[sessionIndex].metaData.quizId !== quizId) {
    throw HTTPError(400, 'Session does not contain quiz');
  }
  const targetSession = data.sessions[sessionIndex];

  if (action !== 'END' && action !== 'GO_TO_ANSWER' && action !== 'GO_TO_FINAL_RESULTS' && action !== 'NEXT_QUESTION' && action !== 'SKIP_COUNTDOWN') {
    throw HTTPError(400, 'Invalid action');
  }

  // Function Logic
  if (targetSession.state === 'LOBBY') { // LOBBY
    if (action !== 'NEXT_QUESTION' && action !== 'END') {
      throw HTTPError(400, 'Invalid action - LOBBY');
    }

    if (action === 'NEXT_QUESTION') {
      actionNextQuestion(sessionId);
    } else if (action === 'END') {
      actionEnd(sessionId);
    }
  } else if (targetSession.state === 'QUESTION_COUNTDOWN') { // QUESTION_COUNTDOWN
    if (action !== 'SKIP_COUNTDOWN' && action !== 'END') {
      throw HTTPError(400, 'Invalid action - QUESTION_COUNTDOWN');
    }

    if (action === 'SKIP_COUNTDOWN') {
      setStateQuestionOpen(sessionId);
    } else if (action === 'END') {
      actionEnd(sessionId);
    }
  } else if (targetSession.state === 'QUESTION_OPEN') { // QUESTION_OPEN
    if (action !== 'GO_TO_ANSWER' && action !== 'END') {
      throw HTTPError(400, 'Invalid action - QUESTION_OPEN');
    }

    if (action === 'GO_TO_ANSWER') {
      actionGoToAnswer(sessionId);
    } else if (action === 'END') {
      actionEnd(sessionId);
    }
  } else if (targetSession.state === 'QUESTION_CLOSE') { // QUESTION_CLOSE
    if (action !== 'GO_TO_ANSWER' && action !== 'END' && action !== 'GO_TO_FINAL_RESULTS' && action !== 'NEXT_QUESTION') {
      throw HTTPError(400, 'Invalid action - QUESTION_CLOSE');
    }

    if (action === 'NEXT_QUESTION') {
      actionNextQuestion(sessionId);
    } else if (action === 'GO_TO_ANSWER') {
      actionGoToAnswer(sessionId);
    } else if (action === 'GO_TO_FINAL_RESULTS') {
      actionGoToFinalResults(sessionId);
    } else if (action === 'END') {
      actionEnd(sessionId);
    }
  } else if (targetSession.state === 'ANSWER_SHOW') { // ACTION_SHOW
    if (action !== 'END' && action !== 'GO_TO_FINAL_RESULTS' && action !== 'NEXT_QUESTION') {
      throw HTTPError(400, 'Invalid action - ANSWER_SHOW');
    }

    if (action === 'NEXT_QUESTION') {
      actionNextQuestion(sessionId);
    } else if (action === 'GO_TO_FINAL_RESULTS') {
      actionGoToFinalResults(sessionId);
    } else if (action === 'END') {
      actionEnd(sessionId);
    }
  } else if (targetSession.state === 'FINAL_RESULTS') { // FINAL_RESULTS
    if (action !== 'END') {
      throw HTTPError(400, 'Invalid action - FINAL_RESULTS');
    }

    if (action === 'END') {
      actionEnd(sessionId);
    }
  } else if (targetSession.state === 'END') {
    throw HTTPError(400, 'Invalid action - END');
  }

  return {};
};

export const getSessionResults = (token: string, quizId: number, sessionId: number): SessionResults => {
  const data = getData();

  const userIndex = data.tokens.findIndex(index => index.token.includes(token));

  if (userIndex === -1 || token === '') {
    throw HTTPError(401, 'Invalid token/empty token');
  }
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);

  if (quizIndex === -1) {
    throw HTTPError(403, 'Invalid quizId');
  }

  const userId = data.tokens[userIndex].userId;
  if (data.quizzes[quizIndex].creatorId !== userId) {
    throw HTTPError(403, 'User does not own quiz');
  }

  const sessionIndex = data.sessions.findIndex(session => session.sessionId === sessionId);
  if (sessionIndex === -1) {
    throw HTTPError(400, 'Invalid sessionId');
  }

  const targetSession = data.sessions[sessionIndex];

  if (targetSession.state !== 'FINAL_RESULTS') {
    throw HTTPError(400, 'Session is not in FINAL_RESULTS state');
  }

  const results = {

    usersRankedByScore: getUsersRankedByScore(sessionIndex),
    questionResults: getQuestionResults(sessionIndex)
  };

  return results;
};

export const playerJoin = (name: string, sessionId: number) => {
  const data = getData();

  const sessionIndex = data.sessions.findIndex(session => session.sessionId === sessionId);
  if (sessionIndex === -1) {
    throw HTTPError(400, 'SessionId Invalid');
  }

  if (data.sessions[sessionIndex].state !== 'LOBBY') {
    throw HTTPError(400, 'Session is not in LOBBY state');
  }

  if (data.sessions[sessionIndex].players.some(player => player.playerName === name)) {
    throw HTTPError(400, 'Name not unique');
  }

  const max = 1000;
  let newPlayerId: number;

  do {
    newPlayerId = Math.floor(Math.random() * max);
  } while (data.sessions.some(session => session.players.some(player => player.playerId === newPlayerId)));

  if (name === '') {
    const randomLetter = Math.random().toString(36).slice(2, 7);
    const randomNumber = Math.floor(Math.random() * (999 - 100 + 1) + 100);
    name = randomLetter + randomNumber.toString();
  }

  const newPlayer: Player = {
    playerId: newPlayerId,
    playerName: name,
    questionScores: []
  };

  data.sessions[sessionIndex].players.push(newPlayer);

  saveData(data);

  if (data.sessions[sessionIndex].players.length === data.sessions[sessionIndex].autoStartNum) {
    actionNextQuestion(data.sessions[sessionIndex].sessionId);
  }

  return { playerId: newPlayerId };
};

/**
  * Update the authorised users password
  *
  * @param {string} token - an identification in the users array
  * @param {number} quizId - Unique Id of quiz owned by User if valid
  *
  * @returns {sessionsView} - if parameters are valid returns list of session Id's that are active or inactive
*/
export const sessionsActiveView = (token: string, quizId: number): sessionsView => {
  const data = getData();

  const userIndex = data.tokens.findIndex(index => index.token.includes(token));
  if (userIndex === -1 || token === '') {
    throw HTTPError(401, 'token is empty or invalid');
  }

  if (!data.quizzes.some(quizzes => quizzes.quizId === quizId) || !data.users[userIndex].quizId.some(quizzId => quizzId === quizId)) {
    throw HTTPError(403, 'Invalid quizId');
  }

  const sessionsView: sessionsView = {
    activeSessions: [],
    inactiveSessions: []
  };

  const sessions = findSessions(quizId);

  for (const session of sessions) {
    if (session.state === 'END') {
      sessionsView.inactiveSessions.push(session.sessionId);
    } else {
      sessionsView.activeSessions.push(session.sessionId);
    }
  }

  sessionsView.activeSessions.sort((a, b) => a - b);
  sessionsView.inactiveSessions.sort((a, b) => a - b);

  return sessionsView;
};

export const playerSendChat = (playerId: number, messageBody: string) => {
  if (messageBody.length > 100 || messageBody.length < 1) {
    throw HTTPError(400, 'Invalid message length');
  }
  const data = getData();

  const sessionIndex = data.sessions.findIndex(session => session.players.some(player => player.playerId === playerId));
  if (sessionIndex === -1) {
    throw HTTPError(400, 'Invalid PlayerId');
  }

  const playerIndex = data.sessions[sessionIndex].players.findIndex(player => player.playerId === playerId);
  const newMessage: Message = {
    messageBody: messageBody,
    playerId: playerId,
    playerName: data.sessions[sessionIndex].players[playerIndex].playerName,
    timeSent: Math.floor(Date.now() / 1000)
  };

  data.sessions[sessionIndex].messages.push(newMessage);

  saveData(data);

  return {};
};

export const sessionViewChat = (playerId: number) => {
  const data = getData();

  const sessionIndex = data.sessions.findIndex(session => session.players.some(player => player.playerId === playerId));
  if (sessionIndex === -1) {
    throw HTTPError(400, 'Invalid PlayerId');
  }

  return { messages: data.sessions[sessionIndex].messages };
};

export const playerAnswer = (playerId: number, questionposition: number, answerId: number[]) => {
  const data = getData();
  const inSession = data.sessions.find(session => session.players.some(player => player.playerId === playerId));
  if (inSession === undefined) {
    throw HTTPError(400, '400 - Invalid PlayerId');
  }

  if (inSession.metaData.questions.length < questionposition) {
    throw HTTPError(400, '400 - Invalid question position');
  }

  if (inSession.state !== 'QUESTION_OPEN') {
    throw HTTPError(400, '400 - Invalid quiz status');
  }

  if (inSession.atQuestion !== questionposition) {
    throw HTTPError(400, '400 - not currently at question');
  }

  if (answerId.length <= 0) {
    throw HTTPError(400, '400 - missing answer');
  }

  const answer = inSession.metaData.questions[questionposition - 1].answers.find(answer => answer.answerId === answerId[0]);
  if (answer === undefined) {
    throw HTTPError(400, '400 - Invalid answer');
  }

  if (new Set(answerId).size !== answerId.length) {
    throw HTTPError(400, '400 - duplicate answer found');
  }

  const player = inSession.players.find(players => players.playerId === playerId);
  player.questionScores[questionposition - 1].answerIds = answerId;
  player.questionScores[questionposition - 1].answerTime = Math.floor(Date.now() / 1000) - inSession.questionStartTime;

  saveData(data);
  return {};
};
/**
  * view the current question of a session for a given player
  * @param {number} playerId - Unique Id of a player in the session
  * @param {number} questionPosition - question position of the question to be returned
  * @returns {playerQuestionView} - if parameters are valid returns question information
*/
export const playerQuestionInformation = (playerId: number, questionPosition: number): playerQuestionView => {
  const data = getData();

  const sessionIndex = data.sessions.findIndex(session => session.players.some(player => player.playerId === playerId));
  if (sessionIndex === -1) {
    throw HTTPError(400, 'Player ID does not exist');
  }

  const questionPositionMax = data.sessions[sessionIndex].metaData.numQuestions;
  const questionPositionMin = 1;

  if (questionPosition > questionPositionMax || questionPosition < questionPositionMin) {
    throw HTTPError(400, 'Question position is not valid for the session this player is in');
  }

  const currentQuestion = data.sessions[sessionIndex].atQuestion;
  if (currentQuestion !== questionPosition) {
    throw HTTPError(400, 'Session is not currently on this question');
  }

  const sessionState = data.sessions[sessionIndex].state;
  if (sessionState === 'END' || sessionState === 'LOBBY' || sessionState === 'QUESTION_COUNTDOWN') {
    throw HTTPError(400, 'Session is in LOBBY, QUESTION_COUNTDOWN, or END state');
  }

  const question = data.sessions[sessionIndex].metaData.questions[questionPosition - 1];

  const answerInformation = [];
  for (const answer of question.answers) {
    answerInformation.push({
      answerId: answer.answerId,
      answer: answer.answer,
      colour: answer.colour
    });
  }

  const questionInformation: playerQuestionView = {
    questionId: question.questionId,
    question: question.question,
    duration: question.duration,
    thumbnailUrl: question.thumbnailUrl,
    points: question.points,
    answers: answerInformation
  };

  saveData(data);
  return questionInformation;
};

export const getPlayerFinalResults = (playerId: number): SessionResults => {
  const data = getData();
  const sessionIndex = data.sessions.findIndex(session => session.players.some(player => player.playerId === playerId));

  // Errors
  if (sessionIndex === -1) {
    throw HTTPError(400, 'Player ID does not exist');
  }

  if (data.sessions[sessionIndex].state !== 'FINAL_RESULTS') {
    throw HTTPError(400, 'Session is not in state FINAL_RESULTS');
  }

  // Function Logic
  return {
    usersRankedByScore: getUsersRankedByScore(sessionIndex),
    questionResults: getQuestionResults(sessionIndex),
  };
};

export const questionResults = (playerId: number, position: number): QuestionAnswers => {
  const data = getData();
  const inSession = data.sessions.find(session => session.players.some(player => player.playerId === playerId));

  // Errors
  if (inSession === undefined) {
    throw HTTPError(400, '400 - Player ID does not exist');
  }

  if (inSession.metaData.questions.length < position) {
    throw HTTPError(400, '400 - question is out of bounds');
  }

  if (inSession.state !== 'ANSWER_SHOW') {
    throw HTTPError(400, '400 - Session is not in state answer_show');
  }

  if (inSession.atQuestion !== position) {
    throw HTTPError(400, '400 - not currently at question');
  }

  const player = inSession.players.find(player => player.playerId === playerId);
  const answersToString = [];
  for (let index = 0; player.questionScores[position - 1].answerIds[index] !== undefined; index++) {
    const input = inSession.metaData.questions[position - 1].answers.find(answers => answers.answerId === player.questionScores[position - 1].answerIds[index]);
    answersToString.push(input.answer);
  }

  let average = 0;
  let count = 0;
  while (inSession.players.length > count) {
    average += inSession.players[count].questionScores[position - 1].answerTime;
    count++;
  }
  average = Math.floor(average / count);

  const answerSheet = [];
  for (let index = 0; inSession.metaData.questions[position - 1].answers.length > index; index++) {
    if (inSession.metaData.questions[position - 1].answers[index].correct === true) {
      answerSheet.push(inSession.metaData.questions[position - 1].answers[index].answerId);
    }
  }

  let percent = 0;
  let correctPeople = 0;
  let index = 0;
  while (inSession.players.length > index) {
    if (correctAnswers(inSession.players[index], answerSheet, position - 1)) {
      correctPeople++;
    }
    index++;
  }
  percent = Math.floor(100 * (correctPeople / index));

  return {
    questionId: inSession.metaData.questions[position - 1].questionId,
    playersCorrectList: answersToString,
    averageAnswerTime: average,
    percentCorrect: percent
  };
};

export const playerStatus = (playerId: number): PlayerStatus => {
  const data = getData();
  const sessionIndex = data.sessions.find(session => session.players.some(player => player.playerId === playerId));

  if (sessionIndex === undefined) {
    throw HTTPError(400, 'Player ID does not exist');
  }

  // Function Logic
  return {
    state: sessionIndex.state,
    numQuestions: sessionIndex.metaData.questions.length,
    atQuestion: sessionIndex.atQuestion
  };
};
