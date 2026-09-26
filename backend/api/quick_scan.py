from fastapi import APIRouter
from pydantic import BaseModel
from services.gemini_service import analyze_document
import json

router = APIRouter()

class QuickScanRequest(BaseModel):
    text: str

@router.post("/quick-scan")
async def quick_scan(request: QuickScanRequest):
    # Perform a light analysis
    try:
        result_str = analyze_document(request.text)
        return json.loads(result_str)
    except Exception as e:
        return {"error": str(e)}
