import crypto from 'crypto';
import { getData, getTimers, saveData } from './dataStore';
import { Answers, COLOUR } from './interface';

export const invalidNameCharacters = (name: string): boolean => {
  const regex = /^[A-Za-z\s'-]+$/;

  if (regex.test(name)) {
    return false;
  } else {
    return true;
  }
};

export function getHashOf(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export const invalidpassword = (password: string): boolean => {
  if ((/[a-zA-Z]/.test(password) === false) || (/\d/.test(password) === false)) {
    return true;
  } else {
    return false;
  }
};

export const findSessions = (quizId: number) => {
  const data = getData();

  const sessions = data.sessions.filter(session => session.metaData.quizId === quizId);

  return sessions;
};

export const validImgUrl = (imgUrl: string): boolean => {
  if (imgUrl.startsWith('https://') || imgUrl.startsWith('http://')) {
    if (imgUrl.endsWith('.jpg') || imgUrl.endsWith('.jpeg') || imgUrl.endsWith('.png')) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

export const setStateQuestionOpen = (sessionId: number) => {
  const data = getData();
  const timers = getTimers();
  // Clear timer
  clearTimer(sessionId);

  // Change State to QUESTION_OPEN
  const sessionIndex = data.sessions.findIndex(session => session.sessionId === sessionId);
  data.sessions[sessionIndex].state = 'QUESTION_OPEN';
  data.sessions[sessionIndex].questionStartTime = Math.floor(Date.now() / 1000);

  // Set new timer to change state to QUESTION_CLOSE
  const questionNum = data.sessions[sessionIndex].atQuestion;
  const duration = data.sessions[sessionIndex].metaData.questions[questionNum - 1].duration;
  const timer = {
    sessionId: sessionId,
    timerId: setTimeout(() => setStateQuestionClose(sessionId), duration * 1000)
  };
  timers.timers.push(timer);

  saveData(data);
};

export const clearTimer = (sessionId: number) => {
  const timers = getTimers();
  const timerIndex = timers.timers.findIndex(timer => timer.sessionId === sessionId);
  if (timerIndex === -1) {
    return;
  }
  clearTimeout(timers.timers[timerIndex].timerId);
  timers.timers.splice(timerIndex, 1);
};

export const setStateQuestionClose = (sessionId: number) => {
  const data = getData();

  // Clear Timers
  clearTimer(sessionId);

  // Change state to QUESTION_CLOSE
  const sessionIndex = data.sessions.findIndex(session => session.sessionId === sessionId);
  data.sessions[sessionIndex].state = 'QUESTION_CLOSE';
  saveData(data);

  // Update score for question
  updateQuestionScore(sessionId);
};

interface PlayerObj {
  answerTime: number,
  playerId: number,
  points: number
}

// Updates final score and rank for each player when a question ends
export const updateQuestionScore = (sessionId: number) => {
  const data = getData();
  const sessionIndex = data.sessions.findIndex(session => session.sessionId === sessionId);
  const questionNum = data.sessions[sessionIndex].atQuestion - 1;
  const questionId = data.sessions[sessionIndex].metaData.questions[questionNum].questionId;

  // Make array of correct answers
  const correctAnswers = [];
  for (const answer of data.sessions[sessionIndex].metaData.questions[questionNum].answers) {
    if (answer.correct === true) {
      correctAnswers.push(answer.answerId);
    }
  }

  // Sort players by correct and empty
  const correctPlayers: PlayerObj[] = [];
  const incorrectPlayers: PlayerObj[] = [];
  const noAnswerPlayers: PlayerObj[] = [];
  // const points = data.sessions[sessionId]
  for (const player of data.sessions[sessionIndex].players) {
    const questionIndex = player.questionScores.findIndex(question => question.questionId === questionId);
    const playerObj = {
      answerTime: player.questionScores[questionIndex].answerTime, // -1 by default if not changed
      playerId: player.playerId,
      points: 0,
    };

    if (player.questionScores[questionIndex].answerTime === -1) { // Didn't answer
      noAnswerPlayers.push(playerObj);
    } else if (correctAnswerChecker(player.questionScores[questionIndex].answerIds, correctAnswers)) {
      playerObj.points = data.sessions[sessionIndex].metaData.questions[questionNum].points;
      correctPlayers.push(playerObj);
    } else {
      incorrectPlayers.push(playerObj);
    }
  }

  correctPlayers.sort((a, b) => a.answerTime - b.answerTime); // sorted by lowest answertime to highest answertime
  // Calculate rank of each player with correct score
  let rank = 1;
  let lowestTime: number;
  if (correctPlayers.length > 0) {
    lowestTime = correctPlayers[0].answerTime;
  }
  for (const player of correctPlayers) {
    const playerIndex = data.sessions[sessionIndex].players.findIndex(players => players.playerId === player.playerId);
    const questionIndex = data.sessions[sessionIndex].players[playerIndex].questionScores.findIndex(question => question.questionId === questionId);
    if (player.answerTime > lowestTime) {
      rank++;
      lowestTime = player.answerTime;
    }

    const score = Math.round(player.points / rank);
    data.sessions[sessionIndex].players[playerIndex].questionScores[questionIndex].score = score;
    data.sessions[sessionIndex].players[playerIndex].questionScores[questionIndex].rank = rank;
  }
  // Gives the last rank to all incorrect players
  for (const player of incorrectPlayers) {
    const playerIndex = data.sessions[sessionIndex].players.findIndex(players => players.playerId === player.playerId);
    const questionIndex = data.sessions[sessionIndex].players[playerIndex].questionScores.findIndex(question => question.questionId === questionId);

    data.sessions[sessionIndex].players[playerIndex].questionScores[questionIndex].score = 0;
    data.sessions[sessionIndex].players[playerIndex].questionScores[questionIndex].rank = rank + 1;
  }
  // Gives a 0 rank to players who didnt score
  for (const player of noAnswerPlayers) {
    const playerIndex = data.sessions[sessionIndex].players.findIndex(players => players.playerId === player.playerId);
    const questionIndex = data.sessions[sessionIndex].players[playerIndex].questionScores.findIndex(question => question.questionId === questionId);

    data.sessions[sessionIndex].players[playerIndex].questionScores[questionIndex].score = 0;
    data.sessions[sessionIndex].players[playerIndex].questionScores[questionIndex].rank = 0;
  }

  saveData(data);
};

const correctAnswerChecker = (playerAnswer: number[], correctAnswer: number[]) => {
  if (playerAnswer.length !== correctAnswer.length) {
    return false;
  }

  playerAnswer = playerAnswer.sort();
  correctAnswer = correctAnswer.sort();

  for (let i = 0; i < playerAnswer.length; i++) {
    if (playerAnswer[i] !== correctAnswer[i]) {
      return false;
    }
  }
  return true;
};

export const actionNextQuestion = (sessionId: number) => { // This does not change the questionAt
  const data = getData();
  const sessionIndex = data.sessions.findIndex(session => session.sessionId === sessionId);
  // Change state to QUESTION_COUNTDOWN
  data.sessions[sessionIndex].state = 'QUESTION_COUNTDOWN';
  data.sessions[sessionIndex].atQuestion += 1;

  // Adds an object to each player to store the answer and score of each player, the questionAt needs to be updated beforehand
  const questionIndex = data.sessions[sessionIndex].atQuestion;
  const newQuestion = data.sessions[sessionIndex].metaData.questions[questionIndex - 1];
  for (const player of data.sessions[sessionIndex].players) {
    player.questionScores.push({
      questionId: newQuestion.questionId,
      answerIds: [],
      answerTime: -1,
      score: 0,
      rank: 0,
    });
  }

  // Set timer to change state to QUESTION_OPEN
  const timers = getTimers();
  const timer = {
    sessionId: sessionId,
    timerId: setTimeout(() => setStateQuestionOpen(sessionId), 3 * 1000)
  };
  timers.timers.push(timer);

  saveData(data);
};

export const actionEnd = (sessionId: number) => {
  const data = getData();

  // Clear timers
  clearTimer(sessionId);

  // Change state to END
  const sessionIndex = data.sessions.findIndex(session => session.sessionId === sessionId);
  data.sessions[sessionIndex].state = 'END';
  data.sessions[sessionIndex].atQuestion = 0;

  saveData(data);
};

export const actionGoToAnswer = (sessionId: number) => {
  let data = getData();

  // Clear timer
  clearTimer(sessionId);

  // Change state to SHOW_ANSWER
  const sessionIndex = data.sessions.findIndex(session => session.sessionId === sessionId);
  if (data.sessions[sessionIndex].state === 'QUESTION_OPEN') {
    updateQuestionScore(sessionId);
  }
  data = getData();
  data.sessions[sessionIndex].state = 'ANSWER_SHOW';

  saveData(data);
};

export const actionGoToFinalResults = (sessionId: number) => {
  const data = getData();

  // Change state to FINAL_RESULTS
  const sessionIndex = data.sessions.findIndex(session => session.sessionId === sessionId);
  data.sessions[sessionIndex].state = 'FINAL_RESULTS';
  data.sessions[sessionIndex].atQuestion = 0;

  saveData(data);
};

export const getRandomColour = (answers: Answers[]) => {
  // Array of preset strings
  const presetColours: COLOUR[] = [
    'red',
    'blue',
    'green',
    'yellow',
    'purple',
    'brown',
    'orange'
  ];

  // Randomly select an index
  let randomIndex: number;

  // Get the selected string
  let selectedColour: COLOUR;

  answers.forEach(answer => {
    do {
      randomIndex = Math.floor(Math.random() * presetColours.length);
      selectedColour = presetColours[randomIndex];
    } while (answers.some(answer => answer.colour === selectedColour));
    answer.colour = selectedColour;
  });
};

export const getQuestionResults = (sessionIndex: number) => {
  const data = getData();

  const questionResults = [];
  for (let questionIndex = 0; questionIndex < data.sessions[sessionIndex].players[0].questionScores.length; questionIndex++) {
    const questionId = data.sessions[sessionIndex].metaData.questions[questionIndex].questionId;
    const questionData = {
      questionId: questionId,
      playersCorrectList: [],
      averageAnswerTime: 0,
      percentCorrect: 0,
    };

    let timeTotal = 0;
    let playerCorrectTotal = 0;
    for (const player of data.sessions[sessionIndex].players) {
      const questionScoreIndex = player.questionScores.findIndex(question => question.questionId === questionId);
      timeTotal += player.questionScores[questionScoreIndex].answerTime;
      if (player.questionScores[questionScoreIndex].score !== 0) {
        playerCorrectTotal++;
        questionData.playersCorrectList.push(player.playerName);
      }
    }

    questionData.averageAnswerTime = Math.round(timeTotal / data.sessions[sessionIndex].players.length);
    questionData.percentCorrect = Math.round(((playerCorrectTotal / data.sessions[sessionIndex].players.length) * 100));
    questionResults.push(questionData);
  }

  return questionResults;
};

export const getUsersRankedByScore = (sessionIndex: number) => {
  const data = getData();

  const usersRankedByScore = [];
  for (const player of data.sessions[sessionIndex].players) {
    const playerScore = {
      name: player.playerName,
      score: 0
    };
    let sum = 0;
    for (const question of player.questionScores) {
      sum += question.score;
    }
    playerScore.score = sum;
    usersRankedByScore.push(playerScore);
  }
  usersRankedByScore.sort((a, b) => b.score - a.score);

  return usersRankedByScore;
};
