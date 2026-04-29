import math
import random

from game import *
from ai import minimax

board = create_board()
game_over = False
turn = random.randint(PLAYER, AI)

print_board(board)

while not game_over:

    # PLAYER MOVE
    if turn == PLAYER:
        col = int(input("Your move (0-6): "))

        if is_valid_location(board, col):
            row = get_next_open_row(board, col)
            drop_piece(board, row, col, PLAYER_PIECE)

            if winning_move(board, PLAYER_PIECE):
                print("You win!")
                game_over = True

            turn = AI
            print_board(board)

    # AI MOVE
    else:
        col, _ = minimax(board, 4, -math.inf, math.inf, True,
                         get_next_open_row, drop_piece, winning_move)

        row = get_next_open_row(board, col)
        drop_piece(board, row, col, AI_PIECE)

        if winning_move(board, AI_PIECE):
            print("AI wins!")
            game_over = True

        turn = PLAYER
        print_board(board)
