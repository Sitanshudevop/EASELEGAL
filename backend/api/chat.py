from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.gemini_service import chat_rag
from services.storage import get_document
import json

router = APIRouter()

class ChatRequest(BaseModel):
    session_id: str
    question: str
    jurisdiction: str = "US - General"
    language: str = "English"

@router.post("/chat")
def chat_with_doc(request: ChatRequest):
    text = get_document(request.session_id)
    if not text:
        raise HTTPException(status_code=404, detail="Document not found for this session")
    
    try:
        result_str = chat_rag(text, request.question, request.jurisdiction, request.language)
        return json.loads(result_str)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
