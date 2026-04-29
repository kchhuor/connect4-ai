import math
import random

from game import (
    create_board, print_board,
    is_valid_location, get_next_open_row,
    drop_piece, winning_move, is_board_full,
    PLAYER, AI, PLAYER_PIECE, AI_PIECE,
)
from ai import minimax

DEPTH = 5

board = create_board()
game_over = False
turn = random.choice([PLAYER, AI])

print("=== Connect 4 ===")
print_board(board)

while not game_over:

    # --- Player turn ---
    if turn == PLAYER:
        while True:
            try:
                col = int(input("Your move (0-6): "))
                if col < 0 or col > 6:
                    print("Please enter a column between 0 and 6.")
                elif not is_valid_location(board, col):
                    print("That column is full. Try another.")
                else:
                    break
            except ValueError:
                print("Invalid input. Enter a number between 0 and 6.")

        row = get_next_open_row(board, col)
        drop_piece(board, row, col, PLAYER_PIECE)
        print_board(board)

        if winning_move(board, PLAYER_PIECE):
            print("You win! Congratulations!")
            game_over = True
        elif is_board_full(board):
            print("It's a draw!")
            game_over = True
        else:
            turn = AI

    # --- AI turn ---
    else:
        print("AI is thinking...")
        col, _ = minimax(board, DEPTH, -math.inf, math.inf, True)

        row = get_next_open_row(board, col)
        drop_piece(board, row, col, AI_PIECE)
        print(f"AI played column {col}.")
        print_board(board)

        if winning_move(board, AI_PIECE):
            print("AI wins! Better luck next time.")
            game_over = True
        elif is_board_full(board):
            print("It's a draw!")
            game_over = True
        else:
            turn = PLAYER