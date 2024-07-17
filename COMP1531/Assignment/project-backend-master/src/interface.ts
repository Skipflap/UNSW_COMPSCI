/**
 * This is a stub dataStore - you can ignore or edit and use it as you please!
 */
export interface ErrorObject {
    error: string;
}

export type Empty = Record<string, never>;

export interface UserIdReturn {
    token: string;
}

export interface QuizInfoReturn {
    quizId: number,
    name: string,
    timeCreated: number,
    timeLastEdited: number,
    numQuestions: number,
    description: string,
    questions: Questions[],
    duration: number,
}

export interface QuizInfoReturnV2 {
    quizId: number,
    name: string,
    timeCreated: number,
    timeLastEdited: number,
    numQuestions: number,
    description: string,
    questions: Questions[],
    duration: number,
    thumbnailUrl: string,
}

export interface UserDetailReturn {
    user: {
        userId: number;
        name: string;
        email: string;
        numSuccessfulLogins: number;
        numFailedPasswordsSinceLastLogin: number;
    };
}

export interface Answers {
    answerId: number,
    answer: string,
    colour: COLOUR,
    correct: boolean,
}

export interface Questions {
    questionId: number,
    question: string,
    duration: number,
    thumbnailUrl?: string,
    points: number,
    answers: Answers[];
}

export interface QuestionsV2 {
    question: string,
    duration: number,
    points: number,
    answers: AnswerCompact[],
    thumbnailUrl: string,
}

export interface Quiz {
    quizId: number;
    creatorId: number;
    name: string;
    timeCreated: number;
    timeLastEdited: number;
    numQuestions: number,
    description: string,
    questions: Questions[];
    duration: number,
    thumbnail?: string,
}

export interface QuizIdReturn {
    quizId: number
}

export interface QuizQuestionIdReturn {
    questionId: number
}

export interface NewQuizQuestionIdReturn {
    newQuestionId: number
}

interface QuizListArray {
    quizId: number,
    name: string
}

export interface QuizListReturn {
    quizzes: QuizListArray[]
}

export interface User {
    userId: number;
    nameFirst: string;
    nameLast: string;
    password: string;
    oldPasswords: string[];
    email: string;
    numSuccessfulLogins: number;
    numFailedPasswordsSinceLastLogin: number;
    quizId: number[];
}

export interface Token {
    userId: number;
    token: string;
}

export interface QuestionBody {
    question: string,
    duration: number,
    points: number,
    answers: AnswerCompact[]
    thumbnailUrl?: string
}
interface AnswerCompact {
    answer: string,
    correct: boolean,
}

export type ACTION = 'NEXT_QUESTION' | 'SKIP_COUNTDOWN' | 'GO_TO_ANSWER' | 'GO_TO_FINAL_RESULTS' | 'END'
export type STATE = 'LOBBY' | 'QUESTION_COUNTDOWN' | 'QUESTION_OPEN' | 'QUESTION_CLOSE' | 'ANSWER_SHOW' | 'FINAL_RESULTS' | 'END'
export type COLOUR = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'brown' | 'orange'

export interface Session {
    sessionId: number
    metaData: Quiz
    players: Player[]
    atQuestion: number
    questionStartTime: number;
    state: STATE
    messages: Message[]
    autoStartNum: number
}

export interface Player {
    playerId: number
    playerName: string
    questionScores: QuestionScore[];
}

interface QuestionScore {
    questionId: number
    answerIds: number[]
    answerTime: number
    score: number
    rank: number
}

export interface Message {
    messageBody: string
    playerId: number
    playerName: string
    timeSent: number
}

export interface SessionResults {
    usersRankedByScore: UserRank[]
    questionResults: QuestionResult[];
}

export interface UserRank {
    name: string
    score: number
}

export interface QuestionResult {
    questionId: number
    playerCorrectList: string[]
    averageAnswerTime: number
    percentCorrect: number
}

export interface UsersRanked {
    name: string,
    score: number
}

export interface SessionStartReturn {
    sessionId: number
}

export interface QuizSessionStatus {
    state: STATE,
    atQuestion: number,
    players: string[],
    metadata: {
        quizId: number,
        name: string,
        timeCreated: number,
        timeLastEdited: number,
        description: string,
        numQuestions: number,
        questions: Questions[],
        duration: number,
        thumbnailUrl: string
    }
}

export interface QuestionsBody {
    question: string,
    duration: number,
    points: number,
    answers: Answers[],
    thumbnailUrl?: string,
}

export interface sessionsView {
    activeSessions: number[],
    inactiveSessions: number[]
}

interface playerQuestionAnswer {
    answerId: number,
    answer: string,
    colour: COLOUR
}

export interface playerQuestionView {
    questionId: number,
    question: string,
    duration: number,
    thumbnailUrl: string,
    points: number,
    answers: playerQuestionAnswer[]
}

export interface QuestionAnswers {
    'questionId': number,
    'playersCorrectList': string[],
    'averageAnswerTime': number,
    'percentCorrect': number
}

export interface PlayerStatus {
    'state': string,
    'numQuestions': number,
    'atQuestion': number
}
