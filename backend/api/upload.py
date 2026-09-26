from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
import re
import uuid
import io
from services.storage import save_document, delete_document

router = APIRouter()

def scrub_pii(text: str) -> str:
    # Scrub emails
    text = re.sub(r'[\w\.-]+@[\w\.-]+', '[EMAIL]', text)
    # Scrub phone numbers
    text = re.sub(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', '[PHONE]', text)
    # Scrub SSN
    text = re.sub(r'\b\d{3}-\d{2}-\d{4}\b', '[SSN]', text)
    
    # Address mock regex
    address_pattern = r'\b\d+\s+([a-zA-Z]+\s+)*(Street|St|Avenue|Ave|Boulevard|Blvd|Road|Rd|Drive|Dr|Lane|Ln|Court|Ct)\b\.?'
    text = re.sub(address_pattern, '[ADDRESS]', text, flags=re.IGNORECASE)
    
    # Very basic Name mock: Titles followed by Capitalized words
    name_pattern = r'\b(Mr\.|Mrs\.|Ms\.|Dr\.)\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b'
    text = re.sub(name_pattern, '[PERSON]', text)
    
    return text

async def extract_text(file: UploadFile) -> str:
    content = await file.read()
    filename = file.filename.lower()
    
    if filename.endswith(".pdf"):
        try:
            import fitz
            doc = fitz.open(stream=content, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text() + "\n"
            return text
        except Exception as e:
            print(f"Error extracting PDF text: {e}")
            raise Exception(f"Failed to process PDF: {str(e)}")
    elif filename.endswith(".docx"):
        import docx
        doc = docx.Document(io.BytesIO(content))
        return "\n".join([para.text for para in doc.paragraphs])
    elif filename.endswith((".png", ".jpg", ".jpeg")):
        import google.generativeai as genai
        import os
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            return "[Error: OCR failed. No GEMINI_API_KEY found.]"
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-3.1-flash-lite')
        
        mime_type = "image/png" if filename.endswith(".png") else "image/jpeg"
        try:
            response = model.generate_content(
                ["Extract all text from this image exactly as it appears. Do not add any extra commentary.", 
                 {"mime_type": mime_type, "data": content}]
            )
            return response.text
        except Exception as e:
            return f"[Error: OCR failed - {str(e)}]"
    else:
        return content.decode('utf-8', errors='ignore')

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    text_content = await extract_text(file)
    scrubbed_text = scrub_pii(text_content)
    
    session_id = str(uuid.uuid4())
    save_document(session_id, file.filename, scrubbed_text)
    
    return {
        "status": "success",
        "session_id": session_id,
        "filename": file.filename,
        "scrubbed_preview": scrubbed_text[:200]
    }

class TextUploadRequest(BaseModel):
    text: str

@router.post("/upload-text")
async def upload_text(request: TextUploadRequest):
    scrubbed_text = scrub_pii(request.text)
    session_id = str(uuid.uuid4())
    save_document(session_id, "quick_scan.txt", scrubbed_text)
    
    return {
        "status": "success",
        "session_id": session_id,
        "filename": "quick_scan.txt",
        "scrubbed_preview": scrubbed_text[:200]
    }

@router.delete("/session/{session_id}")
async def delete_session(session_id: str):
    delete_document(session_id)
    return {"status": "success", "message": "Session data securely deleted."}
