import { getData, getTimers, saveData } from './dataStore';
import { Empty } from './interface';
import HTTPError from 'http-errors';
import fs from 'fs';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
/**
* Reset the state of dataStore
* @param {}
* @returns {} - when clear successfully runs
*/
export const clear = (): Empty => {
  const data = getData();
  const timerStore = getTimers();
  for (const timer of timerStore.timers) {
    clearTimeout(timer.timerId);
  }
  timerStore.timers = [];

  data.users = [];
  data.quizzes = [];
  data.tokens = [];
  data.trash = [];
  data.tokens = [];
  data.sessions = [];
  saveData(data);
  return {};
};

export const getFinalResultsCSV = (quizId: number, sessionId: number, token: string) => {
  const data = getData();

  // Errors
  const userIndex = data.tokens.findIndex(index => index.token.includes(token));
  if (userIndex === -1 || token === '') {
    throw HTTPError(401, 'Invalid token');
  }
  const userId = data.tokens[userIndex].userId;

  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  if (data.quizzes[quizIndex].creatorId !== userId) {
    throw HTTPError(403, 'User does not own quiz');
  }

  const sessionIndex = data.sessions.findIndex(session => session.sessionId === sessionId);
  if (sessionIndex === -1) {
    throw HTTPError(400, 'Invalid SessionId');
  }

  if (data.sessions[sessionIndex].metaData.quizId !== quizId) {
    throw HTTPError(400, 'Session does not contatin quiz');
  }

  if (data.sessions[sessionIndex].state !== 'FINAL_RESULTS') {
    throw HTTPError(400, 'Session no in FINAL_RESULTS STATE');
  }

  // Function Logic
  // Making data table
  const results = [];
  const initialTitle = ['Player'];
  for (let numQ = 1; numQ <= data.sessions[sessionIndex].players[0].questionScores.length; numQ++) {
    initialTitle.push(`question${numQ}score`);
    initialTitle.push(`question${numQ}rank`);
  }

  for (const player of data.sessions[sessionIndex].players) {
    const playerResults = [player.playerName];
    for (const question of player.questionScores) {
      playerResults.push(question.score.toString());
      playerResults.push(question.rank.toString());
    }
    results.push(playerResults);
  }
  const sortedResults = results.slice().sort((a, b) => a[0].localeCompare(b[0]));
  sortedResults.splice(0, 0, initialTitle);

  let dataString = '';
  for (let i = 0; i < sortedResults.length; i++) {
    for (let y = 0; y < sortedResults[i].length; y++) {
      dataString = dataString + `${sortedResults[i][y]},`;
    }
    dataString = dataString + '\n';
  }

  fs.writeFile(`./csv-results/${sessionId}.csv`, dataString, 'utf-8', (err) => {
    if (err) console.log(err);
    else console.log('Data saved');
  });

  return { url: `${SERVER_URL}/csv-results/${sessionId}.csv` };
};
