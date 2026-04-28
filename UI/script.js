const ROW_COUNT = 6;
const COLUMN_COUNT = 7;

const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const resetButton = document.getElementById('reset');

let board = [];

function createEmptyBoard() {
  board = [];
  for (let r = 0; r < ROW_COUNT; r++) {
    const row = [];
    for (let c = 0; c < COLUMN_COUNT; c++) {
      row.push(0);
    }
    board.push(row);
  }
}

function renderBoard() {
  boardElement.innerHTML = '';
  for (let r = ROW_COUNT - 1; r >= 0; r--) {
    for (let c = 0; c < COLUMN_COUNT; c++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = r;
      cell.dataset.col = c;

      const value = board[r][c];
      if (value === 1) cell.classList.add('player');
      if (value === 2) cell.classList.add('ai');

      boardElement.appendChild(cell);
    }
  }
}
function highlightColumn(col) {
  const cells = document.querySelectorAll(`.cell[data-col='${col}']`);
  cells.forEach(cell => cell.classList.add('hover'));
}

function clearHighlights() {
  const cells = document.querySelectorAll('.cell.hover');
  cells.forEach(cell => cell.classList.remove('hover'));
}

function resetGame() {
  createEmptyBoard();
  renderBoard();
  statusElement.textContent = 'Your turn';
  boardElement.style.pointerEvents = "auto";
}

function getNextOpenRow(col) {
  for (let r = 0; r < ROW_COUNT; r++) {
    if (board[r][col] === 0) return r;
  }
  return null;
}

function checkWin(piece) {
  // Horizontal check
  for (let r = 0; r < ROW_COUNT; r++) {
    for (let c = 0; c < COLUMN_COUNT - 3; c++) {
      if (
        board[r][c] === piece &&
        board[r][c+1] === piece &&
        board[r][c+2] === piece &&
        board[r][c+3] === piece
      ) {
        return true;
      }
    }
  }

  // Vertical check
  for (let c = 0; c < COLUMN_COUNT; c++) {
    for (let r = 0; r < ROW_COUNT - 3; r++) {
      if (
        board[r][c] === piece &&
        board[r+1][c] === piece &&
        board[r+2][c] === piece &&
        board[r+3][c] === piece
      ) {
        return true;
      }
    }
  }

  // Positive diagonal check (\)
  for (let r = 0; r < ROW_COUNT - 3; r++) {
    for (let c = 0; c < COLUMN_COUNT - 3; c++) {
      if (
        board[r][c] === piece &&
        board[r+1][c+1] === piece &&
        board[r+2][c+2] === piece &&
        board[r+3][c+3] === piece
      ) {
        return true;
      }
    }
  }

  // Negative diagonal check (/)
  for (let r = 3; r < ROW_COUNT; r++) {
    for (let c = 0; c < COLUMN_COUNT - 3; c++) {
      if (
        board[r][c] === piece &&
        board[r-1][c+1] === piece &&
        board[r-2][c+2] === piece &&
        board[r-3][c+3] === piece
      ) {
        return true;
      }
    }
  }

  return false;
}
function handleColumnClick(col) {
  const row = getNextOpenRow(col);
  if (row === null) return; // column full

  board[row][col] = 1; // player piece
  renderBoard();

  // Check if player wins
  if (checkWin(1)) {
    statusElement.textContent = "You win!";
    boardElement.style.pointerEvents = "none"; // disable further clicks
    return;
  }

  statusElement.textContent = "AI turn (placeholder)";
}

resetButton.addEventListener('click', resetGame);
boardElement.addEventListener('mouseover', (e) => {
  const cell = e.target;
  if (!cell.classList.contains('cell')) return;

  const col = Number(cell.dataset.col);
  clearHighlights();
  highlightColumn(col);
});

boardElement.addEventListener('mouseout', (e) => {
  clearHighlights();
});
boardElement.addEventListener('click', (e) => {
  const cell = e.target;
  if (!cell.classList.contains('cell')) return;

  const col = Number(cell.dataset.col);
  handleColumnClick(col);
});

resetGame();
