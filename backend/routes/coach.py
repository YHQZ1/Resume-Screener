from fastapi import APIRouter, HTTPException
from backend.models.schemas import AgentRequest, AgentResponse
from nlp.agent import run_threshold_agent
import logging

router = APIRouter()


@router.post("/agent/coach", response_model=AgentResponse)
async def coach(request: AgentRequest):
    try:
        result = run_threshold_agent(request.resume_result, threshold=request.threshold)
        return AgentResponse(**result)
    except Exception as e:
        logging.error(f"Agent evaluation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
