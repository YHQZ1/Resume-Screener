from fastapi import APIRouter, HTTPException
from backend.models.schemas import AgentRequest, AgentResponse
from nlp.agent import run_threshold_agent
import logging
import time

router = APIRouter()


@router.post("/agent/coach", response_model=AgentResponse)
async def coach(request: AgentRequest):
    start = time.time()
    try:
        result = run_threshold_agent(request.resume_result, threshold=request.threshold)
        
        elapsed = time.time() - start
        logging.info(f"[METRIC] /agent/coach response time: {elapsed:.3f}s")
        
        return AgentResponse(**result)
    except Exception as e:
        logging.error(f"Agent evaluation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
