// Game board dimension
const ROW_COUNT = 6;
const COLUMN_COUNT = 7;

// Board cell values
const PLAYER = 1;
const AI = 2;
const EMPTY = 0;

// Win condition length
const WIN_LENGTH = 4;

// Center columns searched first for better alpha-beta pruning
const COL_ORDER = [3, 2, 4, 1, 5, 0, 6];

// DOM
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const resetButton = document.getElementById('reset');
const diffBtns = document.querySelectorAll('.diff-btn');

// Performance and win stat display elements
const depthStat = document.getElementById('depthStat');
const runtimeStat = document.getElementById('runtimeStat');
const scoreStat = document.getElementById('scoreStat');
const aiWinsStat = document.getElementById('aiWinsStat');
const playerWinsStat = document.getElementById('playerWinsStat');
const winRateStat = document.getElementById('winRateStat');

// Running win totals across games
let aiWins = 0;
let playerWins = 0;

// Game state
let board = [];
let gameOver = false;
let playerTurn = true;
let aiDepth = 2; // Default depth/difficulty(easy)

// Board helpers
function createEmptyBoard() // Fills board array with empty cells
{
  board = Array.from({ length: ROW_COUNT }, () => Array(COLUMN_COUNT).fill(EMPTY));
}

// Returns lowest empty row in a column, null if column is full
function getNextOpenRow(b, col) 
{
  for (let r = 0; r < ROW_COUNT; r++) {
    if (b[r][col] === EMPTY) return r;
  }
  return null;
}

// Returns all columns that still have space, ordered center-first
function getValidCols(b) 
{
  return COL_ORDER.filter(c => b[ROW_COUNT - 1][c] === EMPTY);
}

// Places a piece into the board array at given position
function dropPiece(b, row, col, piece) 
{
  b[row][col] = piece;
}

// Returns a fresh copy of board so original isn't modified during search
function cloneBoard(b) 
{
  return b.map(row => [...row]);
}

// Win condition check
function checkWin(b, piece) // Checks if given piece has 4 in a row in any direction
{
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

// Returns [row, col] coordinates of the 4 winning cells for flashing on screen
function getWinningCells(b, piece) 
{
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

// Returns true if no columns have space left
function isBoardFull(b) 
{
  return getValidCols(b).length === 0;
}

// Returns true if game is over; someone won or board is full
function isTerminal(b) 
{
  return checkWin(b, PLAYER) || checkWin(b, AI) || isBoardFull(b);
}

// Heuristic scoring
function scoreWindow(window, piece) // Scores a single window of 4 cells based on how favorable for given piece
{
  const opp = piece === AI ? PLAYER : AI;
  const pieceCount = window.filter(v => v === piece).length;
  const emptyCount = window.filter(v => v === EMPTY).length;
  const oppCount = window.filter(v => v === opp).length;

  if (pieceCount === 4) return 100000; // win
  if (pieceCount === 3 && emptyCount === 1) return 10; // 3 in a row + empty
  if (pieceCount === 2 && emptyCount === 2) return 3; // 2 in a row + empty
  if (oppCount === 3 && emptyCount === 1) return -80; // block oponent threat
  return 0;
}

// Scores the full board + rewards center control and strong windows of 4
function scoreBoard(b, piece) 
{
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
function minimax(b, depth, alpha, beta, maximizing) // Searches ahead up to depth moves, pruning branches that won't change the outcome
{
  // Base case: depth limit reached or game over
  if (depth === 0 || isTerminal(b)) 
    {
    if (checkWin(b, AI)) return { score: 1000000 + depth }; // AI wins
    if (checkWin(b, PLAYER)) return { score: -1000000 - depth }; // Player wins
    if (isBoardFull(b)) return { score: 0 }; // Draw
    return { score: scoreBoard(b, AI) }; // Heuristic estimate
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
      if (alpha >= beta) break; // Prune since player won't allow this branch
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
      if (alpha >= beta) break; // Prune since AI won't allow this branch
    }
    return { score: value, col: bestCol };
  }
}

// Render, redraws boards
function renderBoard() 
{
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

// Highlights all empty cells in column when player hovers over
function highlightColumn(col) 
{
  clearHighlights();
  document.querySelectorAll(`.cell[data-col='${col}']`).forEach(cell => {
    if (!cell.classList.contains('player') && !cell.classList.contains('ai'))
      cell.classList.add('hover');
  });
}

// Removes all hover highlights from board
function clearHighlights() 
{
  document.querySelectorAll('.cell.hover').forEach(c => c.classList.remove('hover'));
}

// Flash animation to 4 winning cells
function flashWinCells(piece) 
{
  const cells = getWinningCells(board, piece);
  if (!cells) return;
  cells.forEach(([r, c]) => {
    const el = document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`);
    if (el) el.classList.add('win-flash');
  });
}

// Game logic
function handleWin(piece)  // Ends game, flashes winning cells, updates score, displays result
{
  gameOver = true;
  flashWinCells(piece);
  boardElement.style.pointerEvents = 'none';
  clearHighlights();
  statusElement.textContent = piece === PLAYER ? 'You win!' : 'AI wins!';
  // Increment win counter, refresh stats display
  if (piece === AI) {
    aiWins++;
  } else {
    playerWins++;
  }
  updateWinStats();
}

// Ends game, shows draw message
function handleDraw() 
{
  gameOver = true;
  boardElement.style.pointerEvents = 'none';
  clearHighlights();
  statusElement.textContent = 'Draw!';
}

// Recalculates and updates win rate display after each game
function updateWinStats() 
{
  const totalGames = aiWins + playerWins;
  const winRate = totalGames === 0 ? 0 : (aiWins / totalGames) * 100;

  aiWinsStat.textContent = aiWins;
  playerWinsStat.textContent = playerWins;
  winRateStat.textContent = winRate.toFixed(1) + '%';
}

// Picks and plays AI's move then updates the stats panel
function doAiMove() 
{
  statusElement.textContent = 'AI thinking…';
  setTimeout(() => {
    const startTime = performance.now();
    let col;
    let score = 0;
    // Easy mode, 30% randomness for weaker play
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

    // Back to player
    playerTurn = true;
    boardElement.style.pointerEvents = 'auto';
    statusElement.textContent = 'Your turn';
  }, 30);
}

// Handles player clicking a column, drops their piece and triggers AI
function handleColumnClick(col) 
{
  if (gameOver || !playerTurn) return;
  const row = getNextOpenRow(board, col);
  if (row === null) return; // collumn full

  playerTurn = false;
  boardElement.style.pointerEvents = 'none';
  dropPiece(board, row, col, PLAYER);
  renderBoard();
  clearHighlights();

  if (checkWin(board, PLAYER)) { handleWin(PLAYER); return; }
  if (isBoardFull(board)) { handleDraw(); return; }

  doAiMove();
}

// Resets all state and redraws fresh board
function resetGame() 
{
  createEmptyBoard();
  renderBoard();
  gameOver = false;
  playerTurn = true;
  boardElement.style.pointerEvents = 'auto';
  clearHighlights();
  statusElement.textContent = 'Your turn';
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

// Init
resetGame();