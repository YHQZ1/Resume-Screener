import os
import sys
import logging
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from contextlib import asynccontextmanager

load_dotenv()

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.routes.analyze import router
from backend.routes.coach import router as coach_router
from nlp.scorer import sbert_model

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        _ = sbert_model
        logging.info("SBERT model loaded successfully.")
    except Exception as e:
        logging.error(f"Failed to load SBERT model on startup: {e}")
    yield


app = FastAPI(
    title="Resume Screener",
    version="1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(coach_router)

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
