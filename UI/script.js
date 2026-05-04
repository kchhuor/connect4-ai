let gameNumber = 1;
// Game board dimension
const ROW_COUNT = 6;
const COLUMN_COUNT = 7;

// Board cell values
const PLAYER = 1;
const AI = 2;
const EMPTY = 0;

// Win condition length
const WIN_LENGTH = 4;

// Center columns searched first (better pruning)
const COL_ORDER = [3, 2, 4, 1, 5, 0, 6];

// DOM
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const resetButton = document.getElementById('reset');
const diffBtns = document.querySelectorAll('.diff-btn');
// Stats
const depthStat = document.getElementById('depthStat');
const runtimeStat = document.getElementById('runtimeStat');
const scoreStat = document.getElementById('scoreStat');
const aiWinsStat = document.getElementById('aiWinsStat');
const playerWinsStat = document.getElementById('playerWinsStat');
const winRateStat = document.getElementById('winRateStat');
let aiWins = 0;
let playerWins = 0;
totalRuntime += runtime;
moveCount++;

const avgRuntime = totalRuntime / moveCount;

// Game state
let board = [];
let gameOver = false;
let playerTurn = true;
let aiDepth = 2; // Default depth

// Board helpers
function createEmptyBoard() {
  board = Array.from({ length: ROW_COUNT }, () => Array(COLUMN_COUNT).fill(EMPTY));
}

function getNextOpenRow(b, col) {
  for (let r = 0; r < ROW_COUNT; r++) {
    if (b[r][col] === EMPTY) return r;
  }
  return null;
}

function getValidCols(b) {
  return COL_ORDER.filter(c => b[ROW_COUNT - 1][c] === EMPTY);
}

function dropPiece(b, row, col, piece) {
  b[row][col] = piece;
}

function cloneBoard(b) {
  return b.map(row => [...row]);
}

// Win condition check
function checkWin(b, piece) {
  // Horizontal
  for (let r = 0; r < ROW_COUNT; r++)
    for (let c = 0; c <= COLUMN_COUNT - WIN_LENGTH; c++)
      if (b[r][c] === piece && b[r][c+1] === piece && b[r][c+2] === piece && b[r][c+3] === piece)
        return true;
  // Vertical
  for (let c = 0; c < COLUMN_COUNT; c++)
    for (let r = 0; r <= ROW_COUNT - WIN_LENGTH; r++)
      if (b[r][c] === piece && b[r+1][c] === piece && b[r+2][c] === piece && b[r+3][c] === piece)
        return true;
  // Diagonal (bottom left to top right)
  for (let r = 0; r <= ROW_COUNT - WIN_LENGTH; r++)
    for (let c = 0; c <= COLUMN_COUNT - WIN_LENGTH; c++)
      if (b[r][c] === piece && b[r+1][c+1] === piece && b[r+2][c+2] === piece && b[r+3][c+3] === piece)
        return true;
  // Diagonal (top left to bottom right)
  for (let r = WIN_LENGTH - 1; r < ROW_COUNT; r++)
    for (let c = 0; c <= COLUMN_COUNT - WIN_LENGTH; c++)
      if (b[r][c] === piece && b[r-1][c+1] === piece && b[r-2][c+2] === piece && b[r-3][c+3] === piece)
        return true;
  return false;
}

function getWinningCells(b, piece) {
  for (let r = 0; r < ROW_COUNT; r++)
    for (let c = 0; c <= COLUMN_COUNT - WIN_LENGTH; c++)
      if (b[r][c]===piece && b[r][c+1]===piece && b[r][c+2]===piece && b[r][c+3]===piece)
        return [[r,c],[r,c+1],[r,c+2],[r,c+3]];
  for (let c = 0; c < COLUMN_COUNT; c++)
    for (let r = 0; r <= ROW_COUNT - WIN_LENGTH; r++)
      if (b[r][c]===piece && b[r+1][c]===piece && b[r+2][c]===piece && b[r+3][c]===piece)
        return [[r,c],[r+1,c],[r+2,c],[r+3,c]];
  for (let r = 0; r <= ROW_COUNT - WIN_LENGTH; r++)
    for (let c = 0; c <= COLUMN_COUNT - WIN_LENGTH; c++)
      if (b[r][c]===piece && b[r+1][c+1]===piece && b[r+2][c+2]===piece && b[r+3][c+3]===piece)
        return [[r,c],[r+1,c+1],[r+2,c+2],[r+3,c+3]];
  for (let r = WIN_LENGTH - 1; r < ROW_COUNT; r++)
    for (let c = 0; c <= COLUMN_COUNT - WIN_LENGTH; c++)
      if (b[r][c]===piece && b[r-1][c+1]===piece && b[r-2][c+2]===piece && b[r-3][c+3]===piece)
        return [[r,c],[r-1,c+1],[r-2,c+2],[r-3,c+3]];
  return null;
}

function isBoardFull(b) {
  return getValidCols(b).length === 0;
}

function isTerminal(b) {
  return checkWin(b, PLAYER) || checkWin(b, AI) || isBoardFull(b);
}

// Heuristic scoring
function scoreWindow(window, piece) {
  const opp = piece === AI ? PLAYER : AI;
  const pieceCount = window.filter(v => v === piece).length;
  const emptyCount = window.filter(v => v === EMPTY).length;
  const oppCount = window.filter(v => v === opp).length;

  if (pieceCount === 4) return 100000;
  if (pieceCount === 3 && emptyCount === 1) return 10;
  if (pieceCount === 2 && emptyCount === 2) return 3;
  if (oppCount === 3 && emptyCount === 1) return -80;
  return 0;
}

function scoreBoard(b, piece) {
  let score = 0;

  // Center column bonus
  const centerCol   = Math.floor(COLUMN_COUNT / 2);
  const centerArray = b.map(row => row[centerCol]);
  score += centerArray.filter(v => v === piece).length * 6;

  // Horizontal
  for (let r = 0; r < ROW_COUNT; r++)
    for (let c = 0; c <= COLUMN_COUNT - WIN_LENGTH; c++)
      score += scoreWindow([b[r][c], b[r][c+1], b[r][c+2], b[r][c+3]], piece);

  // Vertical
  for (let c = 0; c < COLUMN_COUNT; c++)
    for (let r = 0; r <= ROW_COUNT - WIN_LENGTH; r++)
      score += scoreWindow([b[r][c], b[r+1][c], b[r+2][c], b[r+3][c]], piece);

  // Diagonal (bottom left to top right)
  for (let r = 0; r <= ROW_COUNT - WIN_LENGTH; r++)
    for (let c = 0; c <= COLUMN_COUNT - WIN_LENGTH; c++)
      score += scoreWindow([b[r][c], b[r+1][c+1], b[r+2][c+2], b[r+3][c+3]], piece);

  // Diagonal (top left to bottom right)
  for (let r = WIN_LENGTH - 1; r < ROW_COUNT; r++)
    for (let c = 0; c <= COLUMN_COUNT - WIN_LENGTH; c++)
      score += scoreWindow([b[r][c], b[r-1][c+1], b[r-2][c+2], b[r-3][c+3]], piece);

  return score;
}

// Minimax + Alpha-beta pruning
function minimax(b, depth, alpha, beta, maximizing) {
  if (depth === 0 || isTerminal(b)) {
    if (checkWin(b, AI)) return { score: 1000000 + depth };
    if (checkWin(b, PLAYER)) return { score: -1000000 - depth };
    if (isBoardFull(b)) return { score: 0 };
    return { score: scoreBoard(b, AI) };
  }

  const validCols = getValidCols(b);
  let bestCol = validCols[0];

  if (maximizing) {
    let value = -Infinity;
    for (const col of validCols) {
      const row = getNextOpenRow(b, col);
      const newBoard = cloneBoard(b);
      dropPiece(newBoard, row, col, AI);
      const result = minimax(newBoard, depth - 1, alpha, beta, false);
      if (result.score > value) { value = result.score; bestCol = col; }
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    return { score: value, col: bestCol };
  } else {
    let value = Infinity;
    for (const col of validCols) {
      const row = getNextOpenRow(b, col);
      const newBoard = cloneBoard(b);
      dropPiece(newBoard, row, col, PLAYER);
      const result = minimax(newBoard, depth - 1, alpha, beta, true);
      if (result.score < value) { value = result.score; bestCol = col; }
      beta = Math.min(beta, value);
      if (alpha >= beta) break;
    }
    return { score: value, col: bestCol };
  }
}

// Render, redraws boards
function renderBoard() {
  boardElement.innerHTML = '';
  for (let r = ROW_COUNT - 1; r >= 0; r--) {
    for (let c = 0; c < COLUMN_COUNT; c++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = r;
      cell.dataset.col = c;
      const val = board[r][c];
      if (val === PLAYER) cell.classList.add('player');
      if (val === AI) cell.classList.add('ai');
      boardElement.appendChild(cell);
    }
  }
}

function highlightColumn(col) {
  clearHighlights();
  document.querySelectorAll(`.cell[data-col='${col}']`).forEach(cell => {
    if (!cell.classList.contains('player') && !cell.classList.contains('ai'))
      cell.classList.add('hover');
  });
}

function clearHighlights() {
  document.querySelectorAll('.cell.hover').forEach(c => c.classList.remove('hover'));
}

function flashWinCells(piece) {
  const cells = getWinningCells(board, piece);
  if (!cells) return;
  cells.forEach(([r, c]) => {
    const el = document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`);
    if (el) el.classList.add('win-flash');
  });
}

// Game logic
function handleWin(piece) {
  gameOver = true;
  flashWinCells(piece);
  boardElement.style.pointerEvents = 'none';
  clearHighlights();
  statusElement.textContent = piece === PLAYER ? 'You win!' : 'AI wins!';
  if (piece === AI) {
    aiWins++;
  } else {
    playerWins++;
  }

  updateWinStats();
  summaryBtn.style.display = 'block';
}

function handleDraw() {
  gameOver = true;
  boardElement.style.pointerEvents = 'none';
  clearHighlights();
  statusElement.textContent = 'Draw!';
}

function updateWinStats() {
  const totalGames = aiWins + playerWins;
  const winRate = totalGames === 0 ? 0 : (aiWins / totalGames) * 100;

  aiWinsStat.textContent = aiWins;
  playerWinsStat.textContent = playerWins;
  winRateStat.textContent = winRate.toFixed(1) + '%';
  summaryBtn.style.display = 'block';
}

function doAiMove() {
  statusElement.textContent = 'AI thinking…';
  setTimeout(() => {
    const startTime = performance.now();
    let col;
    let score = 0;
    // Easy mode randomness
    if (aiDepth === 2 && Math.random() < 0.3) {
      const validCols = getValidCols(board);
      col = validCols[Math.floor(Math.random() * validCols.length)];
      score = 0; // random move has no minimax score
    } else {
      const result = minimax(board, aiDepth, -Infinity, Infinity, true);
      col = result.col;
      score = result.score;
    }
    const endTime = performance.now();
    const runtime = endTime - startTime;

    // Update stats
    depthStat.textContent = aiDepth;
    runtimeStat.textContent = runtime.toFixed(2);
    scoreStat.textContent = score;
    const row = getNextOpenRow(board, col);
    dropPiece(board, row, col, AI);
    renderBoard();

    if (checkWin(board, AI)) { handleWin(AI); return; }
    if (isBoardFull(board)) { handleDraw(); return; }

    playerTurn = true;
    boardElement.style.pointerEvents = 'auto';
    statusElement.textContent = 'Your turn';
  }, 30);
}

function handleColumnClick(col) {
  if (gameOver || !playerTurn) return;
  const row = getNextOpenRow(board, col);
  if (row === null) {
    boardElement.classList.add("shake");
    setTimeout(() => boardElement.classList.remove("shake"), 200);
    return;
}

  playerTurn = false;
  boardElement.style.pointerEvents = 'none';
  dropPiece(board, row, col, PLAYER);
  renderBoard();
  clearHighlights();

  if (checkWin(board, PLAYER)) { handleWin(PLAYER); return; }
  if (isBoardFull(board)) { handleDraw(); return; }

  doAiMove();
}

function resetGame() {
  createEmptyBoard();
  renderBoard();
  gameOver = false;
  playerTurn = true;
  boardElement.style.pointerEvents = 'auto';
  clearHighlights();
  statusElement.textContent = 'Your turn';
  document.getElementById("gameNumber").textContent = "Game " + gameNumber;
  summaryBtn.style.display = 'none';
gameNumber++;
}

// Event listeners
boardElement.addEventListener('click', e => {
  const cell = e.target.closest('.cell');
  if (!cell) return;
  handleColumnClick(Number(cell.dataset.col));
});

boardElement.addEventListener('mouseover', e => {
  const cell = e.target.closest('.cell');
  if (!cell || !playerTurn || gameOver) return;
  highlightColumn(Number(cell.dataset.col));
});

boardElement.addEventListener('mouseleave', clearHighlights);

resetButton.addEventListener('click', resetGame);

// Difficulty buttons, switching resets the board
diffBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    diffBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    aiDepth = Number(btn.dataset.depth);
    resetGame();
  });
});
// Summary function
const summaryBtn = document.getElementById('summaryBtn');

summaryBtn.addEventListener('click', () => {
  alert(`
Game Summary

Depth: ${aiDepth}
Total Moves: ${moveCount}
Average Runtime: ${(totalRuntime / moveCount).toFixed(2)} ms
AI Wins: ${aiWins}
Player Wins: ${playerWins}
  `);
});
// Init
resetGame();