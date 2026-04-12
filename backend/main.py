import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from backend.routes.analyze import router
from nlp.scorer import sbert_model

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-warm SBERT model to ensure immediate availability for first request
    _ = sbert_model
    yield

app = FastAPI(
    title="FlowATS Engine",
    version="2.1.0",
    lifespan=lifespan,
)

# Robust CORS configuration for production deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

if __name__ == "__main__":
    # Standard entry point for Uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)