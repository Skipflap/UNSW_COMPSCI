export enum Objection {
  /**
   * By default, enum are integers 0, 1, 2, ...
   * However, we can also give them string values
   */
  ARGUMENTATIVE = 'argumentative',
  COMPOUND = 'compound',
  HEARSAY = 'hearsay',
  LEADING = 'leading',
  NON_RESPONSIVE = 'non-responsive',
  RELEVANCE = 'relevance',
  SPECULATION = 'speculation',
}

export enum ExaminationType {
  /**
   * It's also possible to specify a "start" number. Below would
   * assign CROSS = 1, DIRECT = 2, the next would be 3, etc.
   */
  CROSS = 1,
  DIRECT,
}

function isArgumentative(question: string) {
  return !question.endsWith('?');
}

function isCoumpound(question: string) {
  return (question.match(/\?/g) || []).length > 1;
}

function isHearsay(testimony: string) {
  return [
    'heard from',
    'told me',
  ].some(w => testimony.includes(w));
}

function isRelevance(question: string, testimony: string) {
  return testimony.length > question.length * 2;
}

function isLeading(question: string) {
  return (
    ['why did you', 'do you agree'].some(w => question.startsWith(w)) ||
        ['right?', 'correct?'].some(w => question.endsWith(w))
  );
}

function isNonResponsive(question: string, testimony: string) {
  const qWords = question.replace(/[^0-9a-z\s]/gi, '').split(/\s+/);
  const aWords = testimony.replace(/[^0-9a-z\s]/gi, '').split(/\s+/);
  return qWords.filter((w) => aWords.includes(w)).length < 1;
}

function isSpeculation(sentence: string) {
  return sentence.includes('think');
}

export function getObjections(
  question: string,
  testimony: string,
  examinationType: ExaminationType
): Set<Objection> {
  if (!question) {
    throw new Error('Question cannot be an empty string.');
  }

  if (!testimony) {
    throw new Error('Testimony cannot be an empty string.');
  }

  question = question.toLowerCase();
  testimony = testimony.toLowerCase();

  const objections = new Set<Objection>();

  if (examinationType === ExaminationType.CROSS) {
    if (isArgumentative(question)) {
      objections.add(Objection.ARGUMENTATIVE);
    }
    if (isSpeculation(question)) {
      objections.add(Objection.SPECULATION);
    }
  } else {
    // Assume ExaminationType.DIRECT
    if (isLeading(question)) {
      objections.add(Objection.LEADING);
    }
    if (isSpeculation(testimony)) {
      objections.add(Objection.SPECULATION);
    }
  }

  if (isCoumpound(question)) {
    objections.add(Objection.COMPOUND);
  }

  if (isHearsay(testimony)) {
    objections.add(Objection.HEARSAY);
  }

  if (isNonResponsive(question, testimony)) {
    objections.add(Objection.NON_RESPONSIVE);
  }

  if (isRelevance(question, testimony)) {
    objections.add(Objection.RELEVANCE);
  }

  return objections;
}
