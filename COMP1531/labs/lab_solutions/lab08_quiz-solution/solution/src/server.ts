import express, { json, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import errorHandler from './errorHandler';

// Importing the example implementation for echo in echo.js
import { echo } from './echo';
import { port, url } from './config.json';

import {
  clear,
  questionAdd,
  questionEdit,
  questionRemove,
  quizCreate,
  quizDetails,
  quizEdit,
  quizRemove,
  quizScheduleRemove,
  quizScheduleRemoveAbort,
  quizzesList,
} from './quiz';
import authorisation from './authorisation';
import createHttpError from 'http-errors';

const PORT: number = parseInt(process.env.PORT || port);

const app = express();

// Use middleware that allows for access from other domains
app.use(cors());
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// (OPTIONAL) Use middleware to log (print to terminal) incoming HTTP requests
app.use(morgan('dev'));

// Root URL
app.get('/', (req: Request, res: Response) => {
  console.log('Print to terminal: someone accessed our root url!');
  res.json(
    {
      message: "Welcome to Lab08 Quiz Server's root URL!",
    }
  );
});

app.get('/echo/echo', (req: Request, res: Response) => {
  // For GET request, parameters are passed in a query string.
  // You will need to typecast for GET requests.
  const message = req.query.message as string;

  // Logic of the echo function is abstracted away in a different
  // file called echo.py.
  res.json(echo(message));
});

app.delete('/clear', (req: Request, res: Response) => {
  res.json(clear());
});

// PROTECTED ROUTES

app.use(authorisation());

app.post('/quiz/create', (req: Request, res: Response) => {
  res.json(quizCreate(req.body.quizTitle, req.body.quizSynopsis));
});

app.get('/quiz/:quizid', (req: Request, res: Response) => {
  res.json(quizDetails(parseInt(req.params.quizid)));
});

app.put('/quiz/:quizid', (req: Request, res: Response) => {
  res.json(quizEdit(parseInt(req.params.quizid), req.body.quizTitle, req.body.quizSynopsis));
});

app.delete('/quiz/:quizid', (req: Request, res: Response) => {
  res.json(quizRemove(parseInt(req.params.quizid)));
});

app.get('/quizzes/list', (req: Request, res: Response) => {
  res.json(quizzesList());
});

app.post('/quiz/:quizid/question', (req: Request, res: Response) => {
  res.json(questionAdd(parseInt(req.params.quizid), req.body.questionString, req.body.questionType, req.body.answers));
});

app.put('/question/:questionid', (req: Request, res: Response) => {
  res.json(questionEdit(parseInt(req.params.questionid), req.body.questionString, req.body.questionType, req.body.answers));
});

app.delete('/question/:questionid', (req: Request, res: Response) => {
  res.json(questionRemove(parseInt(req.params.questionid)));
});

app.delete('/quiz/:quizid/schedule/remove', (req: Request, res: Response) => {
  res.json(quizScheduleRemove(parseInt(req.params.quizid), parseInt(req.query.secondsFromNow as string)));
});

app.post('/quiz/:quizid/schedule/remove/abort', (req: Request, res: Response) => {
  res.json(quizScheduleRemoveAbort(parseInt(req.params.quizid)));
});

app.use((req: Request, _: Response) => {
  throw new createHttpError.NotFound(`No such route ${req.method} ${req.path}!`);
});

/**
 * Using COMP1531's error handling middleware. This must be declared
 * after your routes!
 */
app.use(errorHandler());

/**
 * Start server
 */
const server = app.listen(PORT, () => {
  console.log(`Started server at URL: '${url}:${PORT}'`);
});

/**
 * For coverage, handle Ctrl+C gracefully
 */
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
