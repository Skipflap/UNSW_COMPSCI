import request, { HttpVerb } from 'sync-request-curl';
import HTTPError from 'http-errors';
import { port, url } from '../config.json';
import { IncomingHttpHeaders } from 'http';
import { ACTION, QuestionBody } from '../interface';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 10000;

// Interface for payload in requestHelper
interface Payload {
  [key: string]: unknown
}

// Helper function to create request functions
const requestHelper = (
  method: HttpVerb,
  path: string,
  payload: Payload,
  headers: IncomingHttpHeaders = {}
) => {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method.toUpperCase())) {
    qs = payload;
  } else {
    // PUT/POST
    json = payload;
  }
  const url = SERVER_URL + path;
  const res = request(method, url, { qs, json, headers, timeout: TIMEOUT_MS });

  const responseBody = JSON.parse(res.body.toString());

  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, JSON.parse(res.body.toString()));
  }

  return responseBody;
};

// Auth Wrappers
// /v1/admin/auth/login POST
export function requestAuthLogin(email: string, password: string) {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/login',
    {
      json: { email, password }
    }
  );
  const bodyString = res.body.toString();
  const bodyObject = JSON.parse(bodyString);

  return bodyObject;
}

export function adminUserDetailsV2(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/v2/admin/user/details',
    {
      headers: { token: token }
    }
  );
  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, JSON.parse(res.body.toString()));
  }
  return JSON.parse(res.body.toString());
}

export function adminAuthLogoutV2(token: string) {
  const res = request(
    'POST',
    SERVER_URL + '/v2/admin/auth/logout',
    {
      headers: { token: token }
    }
  );
  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, JSON.parse(res.body.toString()));
  }
  return JSON.parse(res.body.toString());
}

// /v1/admin/auth/register POST
export function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/register',
    {
      json: { email, password, nameFirst, nameLast }
    }
  );

  return JSON.parse(res.body.toString());
}

export function requestUserDetailsUpdateV2(token: string, email: string, nameFirst: string, nameLast: string) {
  return requestHelper('PUT', '/v2/admin/user/details', { email, nameFirst, nameLast }, { token });
}

export function requestUserPasswordUpdateV2(token: string, oldPassword: string, newPassword: string) {
  return requestHelper('PUT', '/v2/admin/user/password', { oldPassword, newPassword }, { token });
}

// Quiz Wrappers
export function requestQuizQuestionMoveV2(quizid: number, questionid: number, token: string, newPosition: number) {
  return requestHelper('PUT', `/v2/admin/quiz/${quizid}/question/${questionid}/move`, { newPosition }, { token });
}

export function requestQuizCreateV2(token: string, name: string, description: string) {
  return requestHelper('POST', '/v2/admin/quiz', { name, description }, { token });
}

export function requestQuizList(token: string) {
  return requestHelper('GET', '/v2/admin/quiz/list', {}, { token });
}

export function requestQuizQuestionDeleteV2(quizid: number, questionid: number, token: string) {
  return requestHelper('DELETE', `/v2/admin/quiz/${quizid}/question/${questionid}`, {}, { token });
}

export function requestQuizThumbnailUpdate(quizid: number, token: string, imgUrl: string) {
  return requestHelper('PUT', `/v1/admin/quiz/${quizid}/thumbnail`, { imgUrl }, { token });
}

export function requestPlayerQuestionInformation(playerid: number, questionposition: number) {
  return requestHelper('GET', `/v1/player/${playerid}/question/${questionposition}`, {}, {});
}

// Other Wrappers
// /v1/clear DELETE
export function requestClear() {
  const res = request(
    'DELETE',
    SERVER_URL + '/v1/clear'
  );
  return JSON.parse(res.body.toString());
}

// Trash Wrappers
// /v2/admin/quiz/${quizid} DELETE
export function requestTrashQuizV2(quizid: number, token: string) {
  const res = request(
    'DELETE',
    SERVER_URL + `/v2/admin/quiz/${quizid}`,
    {
      headers: { token: token }
    }
  );
  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, JSON.parse(res.body.toString()));
  }
  return JSON.parse(res.body.toString());
}

// /v2/admin/quiz/trash GET
export function requestViewTrashV2(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/v2/admin/quiz/trash',
    {
      headers: { token: token }
    }
  );
  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, JSON.parse(res.body.toString()));
  }
  return JSON.parse(res.body.toString());
}

// /v2/admin/quiz/trash/empty DELETE
export function requestEmptyTrashV2(token: string, quizIds: number[]) {
  const res = request(
    'DELETE',
    SERVER_URL + '/v2/admin/quiz/trash/empty',
    {
      headers: { token: token },
      qs: { quizIds: JSON.stringify(quizIds) }
    }
  );
  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, JSON.parse(res.body.toString()));
  }
  return JSON.parse(res.body.toString());
}

// /v2/admin/quiz/{quizid}/restore POST
export function requestRestoreQuizV2(token: string, quizId: number) {
  const res = request(
    'POST',
    SERVER_URL + `/v2/admin/quiz/${quizId}/restore`,
    {
      headers: { token: token }
    }
  );
  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, JSON.parse(res.body.toString()));
  }
  return JSON.parse(res.body.toString());
}

export function adminQuizDuplicate(token: string, quizId: number, questionId: number) {
  const res = request(
    'POST',
    SERVER_URL + `/v2/admin/quiz/${quizId}/question/${questionId}/duplicate`,
    {
      headers: { token: token }
    }
  );
  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, JSON.parse(res.body.toString()));
  }
  return JSON.parse(res.body.toString());
}

// /v2/admin/quiz/{quizid}/ GET
export function requestGetQuizInfoV2(quizid: number, testtoken: string) {
  const res = request('GET', `${SERVER_URL}/v2/admin/quiz/${quizid}`, {
    headers: { token: testtoken } // Include token in the request
  });

  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, JSON.parse(res.body.toString()));
  }

  return JSON.parse(res.body.toString());
}

// /v2/admin/quiz/{quizid}/name PUT
export function requestUpdateQuizNameV2(quizid: number, testtoken: string, newname: string) {
  const res = request('PUT', `${SERVER_URL}/v2/admin/quiz/${quizid}/name`, {
    headers: { token: testtoken }, // Include token in the request
    json: { name: newname }
  });

  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, JSON.parse(res.body.toString()));
  }

  return JSON.parse(res.body.toString());
}

// /v2/admin/quiz/{quizid}/description PUT
export function adminQuizDescriptionUpdateV2(quizid: number, token: string, newDescription: string) {
  const res = request('PUT', `${SERVER_URL}/v2/admin/quiz/${quizid}/description`, {
    headers: { token: token }, // Include token in the request
    json: { description: newDescription }
  });

  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, JSON.parse(res.body.toString()));
  }

  return JSON.parse(res.body.toString());
}

// /v2/admin/quiz/{quizid}/question POST
export function requestCreateQuizQuestionV2(testtoken: string, quizid: number, questionBody: QuestionBody) {
  const res = request('POST', `${SERVER_URL}/v2/admin/quiz/${quizid}/question`, {
    headers: { token: testtoken },
    json: { questionBody }
  });

  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, JSON.parse(res.body.toString()));
  }

  return JSON.parse(res.body.toString());
}

export function requestUpdateQuestionV2(token: string, quizid: number, questionid: number, questionBody: QuestionBody) {
  return requestHelper('PUT', `/v2/admin/quiz/${quizid}/question/${questionid}`, { questionBody }, { token });
}

export function requestQuizTransfer(token: string, userEmail: string, quizIdTransfer: number) {
  return requestHelper('POST', `/v2/admin/quiz/${quizIdTransfer}/transfer`, { userEmail }, { token });
}

// Session Wrappers
export function requestSessionStart(token: string, autoStartNum: number, quizid: number) {
  return requestHelper('POST', `/v1/admin/quiz/${quizid}/session/start`, { autoStartNum }, { token });
}

export function requestSessionView(token: string, quizid: number) {
  return requestHelper('GET', `/v1/admin/quiz/${quizid}/sessions`, {}, { token });
}

export function requestSessionStateUpdate(token: string, quizid: number, sessionid: number, action: ACTION) {
  return requestHelper('PUT', `/v1/admin/quiz/${quizid}/session/${sessionid}`, { action }, { token });
}

export function requestSessionGetResults(token: string, sessionId: number, quizid : number) {
  return requestHelper('GET', `/v1/admin/quiz/${quizid}/session/${sessionId}/results`, {}, { token });
}

export function requestGetQuizSessionStatus(token: string, quizid: number, sessionid: number) {
  return requestHelper('GET', `/v1/admin/quiz/${quizid}/session/${sessionid}`, {}, { token });
}

// Player Wrappers
export function requestPlayerJoin(name: string, sessionId: number) {
  return requestHelper('POST', '/v1/player/join', { sessionId: sessionId, name: name }, {});
}

export function requestPlayerSendChat(playerId: number, messageBody: string) {
  return requestHelper('POST', `/v1/player/${playerId}/chat`, { message: { messageBody } }, {});
}

export function requestPlayerAnswer(playerId: number, questionposition: number, answerId: number[]) {
  return requestHelper('PUT', `/v1/player/${playerId}/question/${questionposition}/answer`, { answerIds: answerId }, {});
}

export function requestSessionChat(playerId: number) {
  return requestHelper('GET', `/v1/player/${playerId}/chat`, {}, {});
}

export function requestGetPlayerFinalResults(playerid: number) {
  return requestHelper('GET', `/v1/player/${playerid}/results`, {}, {});
}

export function requestGetFinalResultsCSV(quizid: number, sessionid: number, token: string) {
  const res = request('GET', `${SERVER_URL}/v1/admin/quiz/${quizid}/session/${sessionid}/results/csv`, {
    headers: { token: token },
  });

  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, JSON.parse(res.body.toString()));
  }

  return JSON.parse(res.body.toString());
}

export function getCSVFile(url: string) {
  const res = request('GET', `${SERVER_URL}/csv-results/${url}`, { qs: {} });
  const buffer = Buffer.from(res.body);
  return buffer.toString('utf8');
}

export function requestQuestionResult(playerId: number, questionposition: number) {
  return requestHelper('GET', `/v1/player/${playerId}/question/${questionposition}/results`, {}, {});
}

export function requestPlayerStatus(playerId: number) {
  return requestHelper('GET', `/v1/player/${playerId}`, {}, {});
}
