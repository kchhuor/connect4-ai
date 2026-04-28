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

function resetGame() {
  createEmptyBoard();
  renderBoard();
  statusElement.textContent = 'Your turn';
}

resetButton.addEventListener('click', resetGame);

resetGame();
