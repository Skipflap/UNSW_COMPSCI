/*
Possible Improvements
  1. Return type of all functions should be explicitly defined
  2. Persistence?
  3. Reduce repetition for common logic
*/

import { Answer, Question, Quiz, QuizItem, QuizList } from './interface';
import HTTPError from 'http-errors';

// ========================================================================= //

// Extend is basically inheriting properties, e.g. Bulldog extends Dog.
interface QuestionData extends Question {
  quizId: number;
}

// Don't need the key 'questions', our data structure is cooler!
interface QuizData extends Omit<Quiz, 'questions'> {
  // For storing a timeout about scheduled quizzes which can be cleared
  quizTimer?: NodeJS.Timeout;
}

interface Data {
  quizzes: QuizData[];
  questions: QuestionData[];
  quizCreationCounter: number;
  questionCreationCounter: number;
}

// ========================================================================= //

const data: Data = {
  quizzes: [],
  questions: [],
  // Hacky way to handle deletion without messing up IDs.
  quizCreationCounter: 0,
  questionCreationCounter: 0,
};

// ========================================================================= //
/**
 * HELPER FUNCTIONS
 * If these helper consts are used in multiple files, it is better to move
 * them into a separate file, e.g. helpers.ts, and export/import.
 */

const generateNextQuizId = () => {
  // Arbitrary ID generation 100, 200, 300, ...
  return ++data.quizCreationCounter * 100;
};

const generateNextQuestionId = () => {
  // Arbitrary ID generation 9, 18, 27, ...
  return ++data.questionCreationCounter * 9;
};

const getQuiz = (quizId: number): QuizData => {
  const quiz = data.quizzes.find(q => q.quizId === quizId);
  if (!quiz) {
    throw HTTPError(400, `Invalid quizId: '${quizId}'`);
  }
  return quiz;
};

const getQuestion = (questionId: number): QuestionData => {
  const question = data.questions.find(q => q.questionId === questionId);
  if (!question) {
    throw HTTPError(400, `Invalid questionId: '${questionId}'`);
  }
  return question;
};

const checkValidString = (label: string, inputString: string) => {
  if (!inputString) {
    throw HTTPError(400, `Invalid ${label}: '${inputString}'`);
  }
};

const checkQuestion = (questionString: string, questionType: string, answers: Answer[]) => {
  checkValidString('questionString', questionString);
  const numCorrect = answers.filter(a => {
    checkValidString('answer', a.answerString);
    return a.isCorrect;
  }).length;

  if (numCorrect <= 0) {
    throw HTTPError(400, 'Must have at least 1 correct answer!');
  }
  if (questionType === 'single') {
    if (numCorrect !== 1) {
      throw HTTPError(400, "Type 'single' must have 1 answer");
    }
  } else if (questionType !== 'multiple') {
    throw HTTPError(400, `Invalid questionType: '${questionType}'`);
  }
};

const removeQuiz = (quizId: number) => (data.quizzes = data.quizzes.filter(q => q.quizId !== quizId));

// ========================================================================= //
/**
 * QUIZ FUNCTIONS
 */

export const quizCreate = (quizTitle: string, quizSynopsis: string) => {
  checkValidString('quizTitle', quizTitle);
  checkValidString('quizSynopsis', quizSynopsis);
  const quizId = generateNextQuizId();
  data.quizzes.push({ quizId, quizTitle, quizSynopsis });
  return { quizId };
};

export const quizDetails = (quizId: number) => {
  const { quizTimer, ...quiz } = getQuiz(quizId);
  const questions: Question[] = data.questions
    .filter(q => q.quizId === quizId)
    .map(({ quizId, ...q }) => q);
  return {
    quiz: {
      ...quiz,
      questions,
    }
  };
};

export const quizEdit = (quizId: number, quizTitle: string, quizSynopsis: string) => {
  const quiz = getQuiz(quizId);
  checkValidString('quizTitle', quizTitle);
  checkValidString('quizSynopsis', quizSynopsis);
  quiz.quizTitle = quizTitle;
  quiz.quizSynopsis = quizSynopsis;
  return {};
};

export const quizRemove = (quizId: number) => {
  // lazy error check (not efficient).
  getQuiz(quizId);
  removeQuiz(quizId);
  return {};
};

export const quizzesList = (): QuizList => {
  const quizzes: QuizItem[] = data.quizzes
    .map(({ quizId, quizTitle }) => ({ quizId, quizTitle }));
  return { quizzes };
};

// ========================================================================= //
/**
 * QUESTION FUNCTIONS
 */

export const questionAdd = (
  quizId: number,
  questionString: string,
  questionType: string,
  answers: Answer[]
) => {
  // Just to error check quizId
  getQuiz(quizId);
  checkQuestion(questionString, questionType, answers);
  const questionId = generateNextQuestionId();
  data.questions.push({
    quizId,
    questionId,
    questionType,
    questionString,
    answers,
  });
  return { questionId };
};

export const questionEdit = (
  questionId: number,
  questionString: string,
  questionType: string,
  answers: Answer[]
) => {
  checkQuestion(questionString, questionType, answers);
  const question = getQuestion(questionId);
  question.questionType = questionType;
  question.questionString = questionString;
  question.answers = answers;
  return {};
};

export const questionRemove = (questionId: number) => {
  // lazy error check (not efficient).
  getQuestion(questionId);
  data.questions = data.questions.filter(q => q.questionId !== questionId);
  return {};
};

export const quizScheduleRemove = (quizId: number, secondsFromNow: number) => {
  const quiz = getQuiz(quizId);
  if (secondsFromNow <= 0) {
    throw HTTPError(400, `Seconds from now must be strictly positive. Given: ${secondsFromNow}`);
  }
  if (quiz.quizTimer !== undefined) {
    throw HTTPError(400, `Quiz with quizId ${quizId} has an active schedule for removal!`);
  }
  quiz.quizTimer = setTimeout(() => {
    removeQuiz(quizId);
    console.log(`Deleted quiz ${quizId} after ${secondsFromNow} seconds`);
  }, secondsFromNow * 1000);
  return {};
};

export const quizScheduleRemoveAbort = (quizId: number) => {
  const quiz = getQuiz(quizId);
  if (quiz.quizTimer === undefined) {
    throw HTTPError(400, `There is no scheduled removal for the quiz with id ${quizId} to abort!`);
  }
  clearTimeout(quiz.quizTimer);
  quiz.quizTimer = undefined;
  return {};
};

// ========================================================================= //
/**
 * OTHER FUNCTIONS
 */

export const clear = () => {
  // Remove any scheduled timers
  data.quizzes.forEach(q => clearTimeout(q.quizTimer));
  data.quizzes = [];
  data.questions = [];
  return {};
};
