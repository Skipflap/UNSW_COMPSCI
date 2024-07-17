import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
import { clear, getFinalResultsCSV } from './other';
import { getData } from './dataStore';
import {
  adminAuthRegister,
  adminUserDetails,
  adminAuthLogin,
  adminAuthLogout,
  adminUserDetailsUpdate,
  adminUserPasswordUpdate
} from './auth';
import {
  adminQuizCreate,
  adminQuizList,
  adminQuizNameUpdate,
  adminQuizNameUpdateV2,
  adminQuizDescriptionUpdate,
  adminQuizDescriptionUpdateV2,
  adminQuizInfo,
  adminQuizInfoV2,
  trashQuiz,
  trashQuizList,
  trashRestore,
  trashEmpty,
  createQuizQuestion,
  createQuizQuestionV2,
  adminQuizTransfer,
  questionDuplicate,
  updateQuestion,
  adminQuizQuestionDelete,
  adminQuizQuestionMove,
  adminQuizThumbnailUpdate,
  updateQuestionV2
} from './quiz';
import {
  adminSessionStart,
  getQuizSessionStatus,
  playerJoin,
  updateSessionState,
  sessionsActiveView,
  playerSendChat,
  sessionViewChat,
  playerAnswer,
  playerQuestionInformation,
  getPlayerFinalResults,
  questionResults,
  getSessionResults,
  playerStatus
} from './session';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================
// let data = getData();

const load = () => {
  if (fs.existsSync('./datastore.json')) {
    const datafile = fs.readFileSync('./datastore.json', { encoding: 'utf8' });
    // data =
    JSON.parse(datafile);
  }
};
load();
const save = () => {
  fs.writeFileSync('./datastore.json', JSON.stringify(getData()));
  // data = getData();
};

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

app.get('/csv-results/:filename', (req, res) => {
  res.sendFile(req.params.filename, { root: './csv-results' });
});

//  ================= /v1/ ===================
app.delete('/v1/clear', (req: Request, res: Response) => {
  res.json(clear());
  // save();
});

//  ================= /v1/admin/ ===================
app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const response = adminQuizCreate(req.body.token, req.body.name, req.body.description, false);
  res.json(response);
});

//  ================= /v1/admin/user/ ===================
app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const input = req.query.token as string;
  const response = adminUserDetails(input);
  res.json(response);
});

app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const { token, email, nameFirst, nameLast } = req.body;
  const response = adminUserDetailsUpdate(token, email, nameFirst, nameLast);
  save();
  res.json(response);
});

app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;
  const response = adminUserPasswordUpdate(token, oldPassword, newPassword);
  save();
  res.json(response);
});

//  ================= /v1/admin/auth/ ===================
app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const response = adminAuthRegister(req.body.email, req.body.password, req.body.nameFirst, req.body.nameLast);

  if ('error' in response) {
    return res.status(400).json(response);
  }
  save();
  res.json(response);
});

app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const email = req.body.email;
  const password = req.body.password;

  const response = adminAuthLogin(email, password);

  if ('error' in response) {
    return res.status(400).json(response);
  }

  save();
  res.json(response);
});

app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const token = req.body.token;
  const response = adminAuthLogout(token.toString());
  save();
  res.json(response);
});

//  ================= /v1/admin/quiz/ ===================
app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  load();
  const input = req.query.token as string;
  const response = adminQuizList(input);

  res.json(response);
});

app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const response = trashQuizList(req.query.token.toString());
  res.json(response);
});

app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  load();
  const quizid = parseInt(req.params.quizid);
  const token = req.query.token as string;
  const response = adminQuizInfo(token, quizid);
  save();
  res.json(response);
});

app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  load();
  const response = trashQuiz(parseInt(req.params.quizid), req.query.token.toString());
  save();
  res.json(response);
});

// ================= /v1/admin/quiz/trash/ ===================
app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  load();
  const response = trashEmpty(req.query.token.toString(), JSON.parse(req.query.quizIds.toString()));
  save();
  res.json(response);
});

// ================= /v1/admin/quiz/:quizid/ ===================
app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  load();

  const quizid = parseInt(req.params.quizid);
  const token = req.body.token as string;
  const newName = req.body.name as string;
  const response = adminQuizNameUpdate(token, quizid, newName);
  save();
  res.json(response);
});

app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  load();
  const quizid = parseInt(req.params.quizid);
  const token = req.body.token;
  const newDescription = req.body.description;
  const response = adminQuizDescriptionUpdate(token, quizid, newDescription);
  save();
  return res.status(200).json(response);
});

app.put('/v1/admin/quiz/:quizid/thumbnail', (req: Request, res: Response) => {
  load();
  const quizid = parseInt(req.params.quizid);
  const token = req.headers.token as string;
  const imgUrl = req.body.imgUrl as string;
  const response = adminQuizThumbnailUpdate(quizid, token, imgUrl);
  save();
  res.json(response);
});

app.post('/v1/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  load();
  const response = trashRestore(parseInt(req.params.quizid), req.body.token);
  save();

  res.json(response);
});

app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  load();
  const quizid = parseInt(req.params.quizid);
  const token = req.body.token;
  const newQuestion = req.body.questionBody;

  const response = createQuizQuestion(token, quizid, newQuestion);

  if ('error' in response) {
    if (response.error.includes('401')) {
      return res.status(401).json(response);
    }
    if (response.error.includes('403')) {
      return res.status(403).json(response);
    }
    if (response.error.includes('400')) {
      return res.status(400).json(response);
    }
  }
  save();
  res.json(response);
});

app.post('/v1/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const response = adminQuizTransfer(req.body.token, req.body.userEmail, parseInt(req.params.quizid));
  save();
  res.json(response);
});

app.get('/v1/admin/quiz/:quizid/sessions', (req: Request, res: Response) => {
  load();
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  const response = sessionsActiveView(token, quizId);
  save();
  res.json(response);
});

// ================= /v1/admin/quiz/:quizid/session/ ===================
app.post('/v1/admin/quiz/:quizid/session/start', (req: Request, res: Response) => {
  const header = req.headers.token as string;
  const response = adminSessionStart(header, req.body.autoStartNum, parseInt(req.params.quizid));
  res.json(response);
});

app.get('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const response = getQuizSessionStatus(req.headers.token.toString(), parseInt(req.params.quizid), parseInt(req.params.sessionid));
  return res.json(response);
});

app.put('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const response = updateSessionState(req.headers.token.toString(), parseInt(req.params.quizid), parseInt(req.params.sessionid), req.body.action);
  return res.json(response);
});
// ================= /v1/admin/quiz/:quizid/session/:sessionid/ =================
app.get('/v1/admin/quiz/:quizid/session/:sessionid/results', (req: Request, res: Response) => {
  const response = getSessionResults(req.headers.token.toString(), parseInt(req.params.quizid), parseInt(req.params.sessionid));

  return res.json(response);
});
// ================= /v1/admin/quiz/:quizid/question/ ===================
app.delete('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  load();
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.query.token as string;
  const response = adminQuizQuestionDelete(quizId, questionId, token, false);
  save();
  res.json(response);
});

app.put('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  load();
  const response = updateQuestion(parseInt(req.params.quizid), parseInt(req.params.questionid), req.body.token, req.body.questionBody);
  if ('error' in response) {
    if (response.error.includes('401')) {
      return res.status(401).json(response);
    }
    if (response.error.includes('403')) {
      return res.status(403).json(response);
    }
    if (response.error.includes('400')) {
      return res.status(400).json(response);
    }
  }
  save();
  res.json(response);
});
// ================= /v1/admin/quiz/:quizid/question/:questionid/ ===================
app.post('/v1/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  load();
  const response = questionDuplicate(parseInt(req.params.quizid), parseInt(req.params.questionid), req.body.token);
  save();
  res.json(response);
});

app.put('/v1/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  load();
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const { token, newPosition } = req.body;
  const response = adminQuizQuestionMove(quizId, questionId, token, newPosition);

  save();
  res.json(response);
});
// ================= /v1/admin/quiz/:quizid/session/:sessionid/ ===================
// ================= /v1/admin/quiz/:quizid/session/:sessionid/results/ ===================
app.get('/v1/admin/quiz/:quizid/session/:sessionid/results/csv', (req: Request, res: Response) => {
  const response = getFinalResultsCSV(parseInt(req.params.quizid), parseInt(req.params.sessionid), req.headers.token.toString());
  return res.json(response);
});
// ================= /v1/player/ ===================
app.post('/v1/player/join', (req: Request, res: Response) => {
  const response = playerJoin(req.body.name, req.body.sessionId);
  res.json(response);
});
// ================= /v1/player/:playerid/ ===================
app.post('/v1/player/:playerid/chat', (req: Request, res: Response) => {
  const response = playerSendChat(parseInt(req.params.playerid), req.body.message.messageBody);
  res.json(response);
});
app.get('/v1/player/:playerid/chat', (req: Request, res: Response) => {
  const response = sessionViewChat(parseInt(req.params.playerid));
  res.json(response);
});
app.get('/v1/player/:playerid/results', (req: Request, res: Response) => {
  const response = getPlayerFinalResults(parseInt(req.params.playerid));
  return res.json(response);
});
// ================= /v1/player/:playerid/question/ ===================
app.get('/v1/player/:playerid/question/:questionposition', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const questionPosition = parseInt(req.params.questionposition);
  const response = playerQuestionInformation(playerId, questionPosition);
  res.json(response);
});
// ================= /v2/ ===================
// ================= /v2/admin/ ===================
app.post('/v2/admin/quiz', (req: Request, res: Response) => {
  const userToken = req.headers.token as string | undefined;
  const response = adminQuizCreate(userToken, req.body.name, req.body.description, true);

  save();
  res.json(response);
});

// ================= /v2/admin/auth/ ===================
app.post('/v2/admin/auth/logout', (req: Request, res: Response) => {
  const token = req.headers.token;
  const response = adminAuthLogout(token.toString());
  save();
  return res.json(response);
});
// ================= /v2/admin/user/ ===================
app.get('/v2/admin/user/details', (req: Request, res: Response) => {
  load();
  const response = adminUserDetails(req.headers.token.toString());
  return res.json(response);
});

app.put('/v2/admin/user/details', (req: Request, res: Response) => {
  load();
  const { email, nameFirst, nameLast } = req.body;
  const token = req.headers.token as string;
  const response = adminUserDetailsUpdate(token, email, nameFirst, nameLast);
  save();
  res.json(response);
});

app.put('/v2/admin/user/password', (req: Request, res: Response) => {
  load();
  const { oldPassword, newPassword } = req.body;
  const token = req.headers.token as string;
  const response = adminUserPasswordUpdate(token, oldPassword, newPassword);
  save();
  res.json(response);
});
// ================= /v2/admin/quiz/ ===================
app.get('/v2/admin/quiz/trash', (req: Request, res: Response) => {
  load();
  const response = trashQuizList(req.headers.token.toString());
  return res.json(response);
});

app.get('/v2/admin/quiz/list', (req: Request, res: Response) => {
  load();
  const header: string = req.headers.token as string;
  const response = adminQuizList(header);
  return res.json(response);
});

app.delete('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  load();
  const response = trashQuiz(parseInt(req.params.quizid), req.headers.token.toString());
  save();
  return res.json(response);
});

app.get('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  load();
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  const response = adminQuizInfoV2(token, quizId);
  save();
  return res.json(response);
});

// ================= /v2/admin/quiz/:quizId/ ===================
app.post('/v2/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  load();
  const response = trashRestore(parseInt(req.params.quizid), req.headers.token.toString());
  save();
  return res.json(response);
});

app.post('/v2/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  load();
  const header = req.headers.token as string;
  const response = adminQuizTransfer(header, req.body.userEmail, parseInt(req.params.quizid));
  save();
  return res.json(response);
});

app.put('/v2/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  load();
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  const newName = req.body.name as string;
  const response = adminQuizNameUpdateV2(quizId, token, newName);
  save();
  return res.json(response);
});

app.put('/v2/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  load();
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  const description = req.body.description as string;

  const response = adminQuizDescriptionUpdateV2(quizId, token, description);

  save();
  return res.json(response);
});

app.post('/v2/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  load();
  const quizId = parseInt(req.params.quizid);
  const token = req.headers.token as string;
  const newQuestion = req.body.questionBody;

  const response = createQuizQuestionV2(token, quizId, newQuestion);
  save();
  res.json(response);
});

// ================= /v2/admin/quiz/:quizId/question/ ===================

app.delete('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  load();
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.headers.token as string;
  const response = adminQuizQuestionDelete(quizId, questionId, token, true);
  save();
  res.json(response);
});

app.put('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const response = updateQuestionV2(parseInt(req.params.quizid), parseInt(req.params.questionid), req.headers.token.toString(), req.body.questionBody);
  return res.json(response);
});

// ================= /v2/admin/quiz/:quizId/question/:questionId/ ===================

app.post('/v2/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  load();
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.headers.token as string;
  const response = questionDuplicate(quizId, questionId, token);
  save();
  res.json(response);
});

app.put('/v2/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  load();
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.headers.token as string;
  const newPosition = req.body.newPosition;
  const response = adminQuizQuestionMove(quizId, questionId, token, newPosition);
  save();
  res.json(response);
});

// ================= /v1/player/{playerid}/question/{questionposition}/ ===================

app.put('/v1/player/:playerid/question/:questionposition/answer', (req: Request, res: Response) => {
  load();
  const quizId = parseInt(req.params.playerid);
  const questionPosition = parseInt(req.params.questionposition);
  const answers = req.body.answerIds;
  const response = playerAnswer(quizId, questionPosition, answers);
  save();
  return res.json(response);
});

app.get('/v1/player/:playerid/question/:questionposition/results', (req: Request, res: Response) => {
  load();
  const playerId = parseInt(req.params.playerid);
  const questionPosition = parseInt(req.params.questionposition);
  const response = questionResults(playerId, questionPosition);
  save();
  return res.json(response);
});

app.get('/v1/player/:playerid', (req: Request, res: Response) => {
  load();
  const playerId = parseInt(req.params.playerid);
  const response = playerStatus(playerId);
  save();
  return res.json(response);
});

// ================= /v2/admin/quiz/trash/ ===================
app.delete('/v2/admin/quiz/trash/empty', (req: Request, res: Response) => {
  load();
  const response = trashEmpty(req.headers.token.toString(), JSON.parse(req.query.quizIds.toString()));
  save();
  return res.json(response);
});

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================
app.use((req: Request, res: Response) => {
  const error = `
    Route not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  res.json({ error });
});

// For handling errors
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
