import express, { Request, Response } from 'express';
import cors from 'cors';

import morgan from 'morgan';

import { echo } from './echo';
import errorHandler from './errorHandler';
import { postCreate, postComment, postView, postsList, clear, postEdit } from './forum';
import { port, url } from './config.json';

const PORT: number = parseInt(process.env.PORT || port);
const SERVER_URL = `${url}:${PORT}`;

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req: Request, res: Response) => {
  console.log('Print to terminal: someone accessed our root url!');
  res.json({ message: "Welcome to Reference Implementation's root URL!" });
});

app.get('/echo/echo', (req: Request, res: Response) => {
  res.json(echo(req.query.message as string));
});

app.post('/post/create', (req: Request, res) => {
  res.json(postCreate(req.body.sender, req.body.title, req.body.content));
});

app.post('/post/:postid/comment', (req: Request, res: Response) => {
  res.json(postComment(parseInt(req.params.postid), req.body.sender, req.body.comment));
});

app.route('/post/:postid').get((req: Request, res: Response) => {
  res.json(postView(parseInt(req.params.postid)));
}).put((req: Request, res: Response) => {
  res.json(postEdit(parseInt(req.params.postid), req.body.sender, req.body.title, req.body.content));
});

app.get('/posts/list', (req: Request, res: Response) => {
  res.json(postsList());
});

app.delete('/clear', (req: Request, res: Response) => {
  res.json(clear());
});

app.use(errorHandler());

const server = app.listen(PORT, () => {
  console.log(`Server started at the URL: '${SERVER_URL}'`);
});

process.on('SIGINT', () => {
  server.close(() => {
    console.log('Shutting down server gracefully.');
    process.exit();
  });
});
