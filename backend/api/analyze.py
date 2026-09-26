from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from services.gemini_service import analyze_document
from services.storage import get_document
import json

router = APIRouter()

class AnalyzeRequest(BaseModel):
    session_id: str
    persona: str = None
    jurisdiction: str = "US - General"
    language: str = "English"

@router.post("/analyze")
def analyze_doc(request: AnalyzeRequest):
    text = get_document(request.session_id)
    if not text:
        raise HTTPException(status_code=404, detail="Document not found for this session")
    
    try:
        result_str = analyze_document(text, request.persona, request.jurisdiction, request.language)
        
        # Strip potential markdown formatting (```json ... ```)
        result_str = result_str.strip()
        if result_str.startswith("```json"):
            result_str = result_str[7:]
        elif result_str.startswith("```"):
            result_str = result_str[3:]
        if result_str.endswith("```"):
            result_str = result_str[:-3]
        result_str = result_str.strip()
        
        data = json.loads(result_str)
        
        # Ensure fallback fields exist in case Gemini returns an empty or partial object
        if "doc_type" not in data:
            data["doc_type"] = "Unknown / Error analyzing"
        if "summary" not in data:
            data["summary"] = "Could not generate summary."
        if "clauses" not in data:
            data["clauses"] = []
        if "jargon_glossary" not in data:
            data["jargon_glossary"] = []
            
        data["raw_text"] = text
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-persona")
def analyze_persona(request: AnalyzeRequest):
    # Wrapper for persona specific analysis if needed differently, 
    # but currently handled by the same service function
    return analyze_doc(request)
