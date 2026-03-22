# AI routes
from fastapi import APIRouter, HTTPException
from typing import List
import os
import uuid
import json
from database import db
from models.schemas import AIRecommendationRequest

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/recommend")
async def ai_recommend(request: AIRecommendationRequest):
    # Mock response since emergentintegrations library is not available in production
    symptoms_text = ", ".join(request.symptoms)
    
    return {
        "health_concern": f"Potential issue related to {symptoms_text}",
        "treatment_approach": "General AYUSH wellness recommendation",
        "suggested_remedies": ["Herbal support", "Balanced diet", "Rest"],
        "note": "AI service is currently in maintenance mode."
    }
