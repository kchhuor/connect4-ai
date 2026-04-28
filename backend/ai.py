# Function to score position of a game board for each player
def score_position(board, piece):
    score = 0
    opponent_piece = PLAYER_PIECE

    # Evaluation board for scoring positions on the game board
    evaluation_board = np.array([[0, 0, 0, 0, 0, 0, 0], 
                                [0, 0, 0, 0, 0, 0, 0], 
                                [0, 0, 0, 0, 0, 0, 0], 
                                [0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0]])