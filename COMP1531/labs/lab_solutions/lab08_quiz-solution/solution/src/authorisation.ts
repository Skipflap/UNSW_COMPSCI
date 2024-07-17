import { Request, Response, NextFunction } from 'express';
import HTTPError from 'http-errors';

// Only necessary because we want to trigger 404 middleware at the end
const authorisation = () => (req: Request, res: Response, next: NextFunction) => {
  // The first condition involving regex is only necessary since we want to
  // skip this check and trigger our 404 middleware defined at the bottom of
  // the file server.ts
  if (/^\/qu(estion|iz)/.test(req.path) && req.headers.lab08quizsecret !== "bruno's fight club") {
    throw HTTPError(401, `Incorrect lab08quizsecret provided in headers: "${req.headers.lab08quizsecret}"`);
  }
  next();
};

export default authorisation;
