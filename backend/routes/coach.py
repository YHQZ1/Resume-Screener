from fastapi import APIRouter, HTTPException  # type: ignore
from backend.models.schemas import AgentRequest, AgentResponse
from nlp.agent import run_threshold_agent

router = APIRouter()


@router.post("/agent/coach", response_model=AgentResponse)
async def coach(request: AgentRequest):
    try:
        result = run_threshold_agent(request.resume_result, threshold=request.threshold)
        return AgentResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
