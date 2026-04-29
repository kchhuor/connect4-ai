import numpy as np

ROW_COUNT = 6
COLUMN_COUNT = 7

PLAYER = 0
AI = 1

PLAYER_PIECE = 1
AI_PIECE = 2
EMPTY = 0


def create_board():
    return np.zeros((ROW_COUNT, COLUMN_COUNT))


def drop_piece(board, row, col, piece):
    board[row][col] = piece


def is_valid_location(board, col):
    return board[ROW_COUNT - 1][col] == 0


def get_valid_locations(board):
    return [c for c in range(COLUMN_COUNT) if is_valid_location(board, c)]


def get_next_open_row(board, col):
    for r in range(ROW_COUNT):
        if board[r][col] == 0:
            return r


def is_board_full(board):
    return len(get_valid_locations(board)) == 0


def print_board(board):
    print(np.flip(board, 0))


def winning_move(board, piece):
    # Horizontal
    for c in range(COLUMN_COUNT - 3):
        for r in range(ROW_COUNT):
            if all(board[r][c + i] == piece for i in range(4)):
                return True

    # Vertical
    for c in range(COLUMN_COUNT):
        for r in range(ROW_COUNT - 3):
            if all(board[r + i][c] == piece for i in range(4)):
                return True

    # Diagonal /
    for c in range(COLUMN_COUNT - 3):
        for r in range(ROW_COUNT - 3):
            if all(board[r + i][c + i] == piece for i in range(4)):
                return True

    # Diagonal \
    for c in range(COLUMN_COUNT - 3):
        for r in range(3, ROW_COUNT):
            if all(board[r - i][c + i] == piece for i in range(4)):
                return True

    return False