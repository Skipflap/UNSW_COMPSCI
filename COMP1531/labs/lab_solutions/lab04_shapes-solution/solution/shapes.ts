/**
 * Solution below, while few lines of code and little repetition,
 * is actually not very scalable/robust.
 * E.g. it may be difficult to modify the code when a new shape
 * is introduced. There is always a trade-off.
 */

interface EdgeFunc {
    (size: number, row: number, col: number): boolean;
}

interface MaxColFunc {
    (size: number, row: number): number
}

export function drawShape(shape: string, size: number, isSolid: boolean) {
  if (size < 0 || !['triangle', 'square'].includes(shape)) {
    return 'Invalid Input';
  }

  const genericEdge: EdgeFunc = (n, r, c) => r === 0 || r === n - 1 || c === 0;

  // Default to square
  let isEdge: EdgeFunc = (n, r, c) => genericEdge(n, r, c) || c === n - 1;
  let getMaxColFunc: MaxColFunc = (size: number, _: number) => size;

  if (shape === 'triangle') {
    isEdge = (n, r, c) => genericEdge(n, r, c) || c === r;
    getMaxColFunc = (_: number, row: number) => row + 1;
  }

  const middleBlocks = isSolid ? '* ' : '  ';
  let drawing = '';
  for (let row = 0; row < size; row++) {
    let line = '';
    for (let col = 0; col < getMaxColFunc(size, row); col++) {
      line += isEdge(size, row, col) ? '* ' : middleBlocks;
    }
    drawing += line.slice(0, -1) + '\n';
  }
  return drawing.slice(0, -1);
}
