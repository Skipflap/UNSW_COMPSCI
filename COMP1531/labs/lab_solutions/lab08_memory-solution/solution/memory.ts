import fs from 'fs';

interface Game {
    score: number;
    mistakesRemaining: number;
    cluesRemaining: number;
    dictionary: string[];
}

let currentGame: Game = {
  score: 0,
  mistakesRemaining: 3,
  cluesRemaining: 3,
  dictionary: [],
};

export function getGameInfo() {
  const { dictionary, ...remainingInfo } = currentGame;
  return remainingInfo;
}

export function addWord(word: string) {
  if (currentGame.mistakesRemaining <= 0) {
    throw new Error('Game is over.');
  }
  if (currentGame.dictionary.includes(word)) {
    currentGame.mistakesRemaining--;
    throw new Error(`Word '${word}' is already in the dictionary!`);
  }
  currentGame.dictionary.push(word);
  currentGame.score += 1;
}

export function removeWord(word: string) {
  if (currentGame.mistakesRemaining <= 0) {
    throw new Error('Game is over.');
  }
  const index = currentGame.dictionary.indexOf(word);
  if (index === -1) {
    currentGame.mistakesRemaining--;
    throw new Error(`Word '${word}' is not in the dictionary!`);
  }
  currentGame.dictionary.splice(index, 1);
  currentGame.score += 1;
}

export function viewDictionary() {
  if (currentGame.cluesRemaining <= 0) {
    if (currentGame.mistakesRemaining > 0) {
      throw new Error('No clues remaining in this active game.');
    }
  } else {
    currentGame.cluesRemaining--;
  }
  return currentGame.dictionary;
}

export function resetGame() {
  currentGame.score = 0;
  currentGame.mistakesRemaining = 3;
  currentGame.cluesRemaining = 3;
  currentGame.dictionary = [];
}

export function saveGame(name: string) {
  if (!/^[0-9a-z]+$/i.test(name)) {
    throw new Error(`Name '${name}' is not alphanumeric!`);
  }

  const filename = 'memory_' + name + '.json';

  if (fs.existsSync(filename)) {
    throw new Error(`File '${filename}' already exits!`);
  }

  fs.writeFileSync(filename, JSON.stringify(currentGame, null, 2));
}

export function loadGame(name: string) {
  if (!/^[0-9a-z]+$/i.test(name)) {
    throw new Error(`Name '${name}' is not alphanumeric!`);
  }
  const filename = 'memory_' + name + '.json';
  if (!fs.existsSync(filename)) {
    throw new Error(`No such file '${filename}'!`);
  }

  currentGame = JSON.parse(fs.readFileSync(filename, 'utf8'));
}
