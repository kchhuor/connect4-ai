import numpy as np
import math
import random

# Game Environment


# Dimensions of the game
ROW_COUNT = 6
COLUMN_COUNT = 7

# PLayer and AI indices
PLAYER = 0
AI = 0

#Player and AI game pieces
PLAYER_PIECE = 1
AI_PIECE = 2

#Create an empty board
def create_board():
    board = np.zeros((ROW_COUNT, COLUMN_COUNT))
    return board

# Drops a game piece onto board at a specific position
def drop_piece(board, row, col, piece):
    board[row][col] = piece

# Checks if a column is a valid place to drop a piece. Return a boolean
def is_valid_location(board, col):
    return board[ROW_COUNT-1][col] == 0

# Finds and returns next open row in a given column
def get_next_open_row(board, col):
    for r in range(ROW_COUNT):
        if board[r][col] == 0:
            return r