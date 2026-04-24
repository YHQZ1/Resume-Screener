import os
import sys
import uvicorn  # type: ignore
from fastapi import FastAPI  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore
from dotenv import load_dotenv  # type: ignore
from contextlib import asynccontextmanager

load_dotenv()

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.routes.analyze import router
from backend.routes.coach import router as coach_router
from nlp.scorer import get_sbert_model


@asynccontextmanager
async def lifespan(app: FastAPI):
    get_sbert_model()
    yield


app = FastAPI(
    title="Resume Screener",
    version="1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://resume-screenerv1.vercel.app"
        "http://localhost:5173",
        "http://localhost:80",
        "http://localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(coach_router)

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
