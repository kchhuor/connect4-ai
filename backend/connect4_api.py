from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()

# Allow your UI (running in browser) to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # you can restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/move")
def get_ai_move(data: dict):
    player_move = data.get("player_move")

    # TEMPORARY AI: choose a random valid column
    ai_move = random.randint(0, 6)

    return {"ai_move": ai_move}