# AI routes
from fastapi import APIRouter, HTTPException
from typing import List
import os
import uuid
import json
from database import db
from models.schemas import AIRecommendationRequest
from emergentintegrations.llm.chat import LlmChat, UserMessage

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/recommend")
async def ai_recommend(request: AIRecommendationRequest):
    llm_key = os.environ.get('EMERGENT_LLM_KEY')
    if not llm_key:
        raise HTTPException(status_code=500, detail="AI service not configured")
    
    symptoms_text = ", ".join(request.symptoms)
    system_pref = f" with preference for {request.preferred_system}" if request.preferred_system else ""
    
    prompt = f"""You are an AYUSH healthcare expert. A patient reports these symptoms: {symptoms_text}.
{system_pref}

Provide:
1. Possible health concern
2. Recommended AYUSH treatment approach
3. Suggested remedy type

Respond in JSON format with keys: health_concern, treatment_approach, suggested_remedies (array)"""
    
    try:
        chat = LlmChat(
            api_key=llm_key,
            session_id=str(uuid.uuid4()),
            system_message="You are a helpful AYUSH healthcare assistant."
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        try:
            recommendation = json.loads(response)
        except json.JSONDecodeError:
            recommendation = {"raw_response": response}
        
        return recommendation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")
