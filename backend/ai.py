import math
import random

from game import (
    ROW_COUNT, COLUMN_COUNT,
    PLAYER_PIECE, AI_PIECE, EMPTY,
    get_valid_locations, get_next_open_row,
    drop_piece, winning_move, is_board_full,
)

WINDOW_LENGTH = 4


def evaluate_window(window, piece):
    score = 0
    opp = PLAYER_PIECE if piece == AI_PIECE else AI_PIECE

    if window.count(piece) == 4:
        score += 100
    elif window.count(piece) == 3 and window.count(EMPTY) == 1:
        score += 10
    elif window.count(piece) == 2 and window.count(EMPTY) == 2:
        score += 4

    if window.count(opp) == 3 and window.count(EMPTY) == 1:
        score -= 80

    return score


def score_position(board, piece):
    score = 0

    # Center column preference
    center = list(board[:, COLUMN_COUNT // 2])
    score += center.count(piece) * 6

    # Horizontal
    for r in range(ROW_COUNT):
        row = list(board[r, :])
        for c in range(COLUMN_COUNT - 3):
            window = row[c:c + WINDOW_LENGTH]
            score += evaluate_window(window, piece)

    # Vertical
    for c in range(COLUMN_COUNT):
        col = list(board[:, c])
        for r in range(ROW_COUNT - 3):
            window = col[r:r + WINDOW_LENGTH]
            score += evaluate_window(window, piece)

    # Diagonal /
    for r in range(ROW_COUNT - 3):
        for c in range(COLUMN_COUNT - 3):
            window = [board[r + i][c + i] for i in range(WINDOW_LENGTH)]
            score += evaluate_window(window, piece)

    # Diagonal \
    for r in range(3, ROW_COUNT):
        for c in range(COLUMN_COUNT - 3):
            window = [board[r - i][c + i] for i in range(WINDOW_LENGTH)]
            score += evaluate_window(window, piece)

    return score


def is_terminal_node(board):
    return (
        winning_move(board, PLAYER_PIECE)
        or winning_move(board, AI_PIECE)
        or is_board_full(board)
    )


def minimax(board, depth, alpha, beta, maximizing_player):
    valid_locations = get_valid_locations(board)
    terminal = is_terminal_node(board)

    if terminal:
        if winning_move(board, AI_PIECE):
            return None, 1_000_000
        elif winning_move(board, PLAYER_PIECE):
            return None, -1_000_000
        else:
            return None, 0  # Draw

    if depth == 0:
        return None, score_position(board, AI_PIECE)

    if maximizing_player:
        value = -math.inf
        column = random.choice(valid_locations)

        for col in valid_locations:
            row = get_next_open_row(board, col)
            temp = board.copy()
            drop_piece(temp, row, col, AI_PIECE)
            new_score = minimax(temp, depth - 1, alpha, beta, False)[1]

            if new_score > value:
                value = new_score
                column = col

            alpha = max(alpha, value)
            if alpha >= beta:
                break

        return column, value

    else:
        value = math.inf
        column = random.choice(valid_locations)

        for col in valid_locations:
            row = get_next_open_row(board, col)
            temp = board.copy()
            drop_piece(temp, row, col, PLAYER_PIECE)
            new_score = minimax(temp, depth - 1, alpha, beta, True)[1]

            if new_score < value:
                value = new_score
                column = col

            beta = min(beta, value)
            if alpha >= beta:
                break

        return column, value