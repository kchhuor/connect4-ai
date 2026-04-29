# import numpy as np
# import math
# import random

# # Game Environment


# # Dimensions of the game
# ROW_COUNT = 6
# COLUMN_COUNT = 7

# # PLayer and AI indices
# PLAYER = 0
# AI = 1

# #Player and AI game pieces
# PLAYER_PIECE = 1
# AI_PIECE = 2

# #Create an empty board
# def create_board():
#     board = np.zeros((ROW_COUNT, COLUMN_COUNT))
#     return board

# # Drops a game piece onto board at a specific position
# def drop_piece(board, row, col, piece):
#     board[row][col] = piece

# # Checks if a column is a valid place to drop a piece. Return a boolean
# def is_valid_location(board, col):
#     return board[ROW_COUNT-1][col] == 0

# # Finds and returns next open row in a given column
# def get_next_open_row(board, col):
#     for r in range(ROW_COUNT):
#         if board[r][col] == 0:
#             return r

import numpy as np

ROW_COUNT = 6
COLUMN_COUNT = 7

PLAYER_PIECE = 1
AI_PIECE = 2


def create_board():
    return np.zeros((ROW_COUNT, COLUMN_COUNT))


def drop_piece(board, row, col, piece):
    board[row][col] = piece


def is_valid_location(board, col):
    return board[ROW_COUNT-1][col] == 0


def get_next_open_row(board, col):
    for r in range(ROW_COUNT):
        if board[r][col] == 0:
            return r


def print_board(board):
    print(np.flip(board, 0))


def winning_move(board, piece):
    # horizontal
    for c in range(COLUMN_COUNT-3):
        for r in range(ROW_COUNT):
            if all(board[r][c+i] == piece for i in range(4)):
                return True

    # vertical
    for c in range(COLUMN_COUNT):
        for r in range(ROW_COUNT-3):
            if all(board[r+i][c] == piece for i in range(4)):
                return True

    # diagonal /
    for c in range(COLUMN_COUNT-3):
        for r in range(ROW_COUNT-3):
            if all(board[r+i][c+i] == piece for i in range(4)):
                return True

    # diagonal \
    for c in range(COLUMN_COUNT-3):
        for r in range(3, ROW_COUNT):
            if all(board[r-i][c+i] == piece for i in range(4)):
                return True

    return False