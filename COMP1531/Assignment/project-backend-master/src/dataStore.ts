import { User, Quiz, Token, Session } from './interface';
import fs from 'fs';

interface DataStore {
  users: User[];
  quizzes: Quiz[];
  tokens: Token[];
  trash: Quiz[];
  sessions: Session[];
}

let dataStore: DataStore = {
  users: [],
  quizzes: [],
  tokens: [],
  trash: [],
  sessions: [],
};

export const getData = (): DataStore => {
  if (fs.existsSync('./datastore.json')) {
    const datafile = fs.readFileSync('./datastore.json', { encoding: 'utf8' });
    dataStore = JSON.parse(datafile);
  }
  return dataStore;
};

export const saveData = (updatedData: DataStore): void => {
  dataStore = updatedData;
  fs.writeFileSync('./datastore.json', JSON.stringify(dataStore));
};

// Timers
interface TimerStore {
  timers: Timer[]
}

interface Timer {
  sessionId: number
  timerId: ReturnType<typeof setTimeout> | null;
}
const timerStore: TimerStore = {
  timers: [],
};

export const getTimers = (): TimerStore => timerStore;
