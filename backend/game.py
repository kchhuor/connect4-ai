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