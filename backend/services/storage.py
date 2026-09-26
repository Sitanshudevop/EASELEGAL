from typing import Dict, Any

# In-memory mock session storage
SESSION_STORAGE: Dict[str, Dict[str, Any]] = {}

def save_document(session_id: str, filename: str, content: str):
    SESSION_STORAGE[session_id] = {
        "filename": filename,
        "content": content
    }

def get_document(session_id: str) -> str:
    session = SESSION_STORAGE.get(session_id)
    if session:
        return session.get("content", "")
    return ""

def delete_document(session_id: str):
    if session_id in SESSION_STORAGE:
        del SESSION_STORAGE[session_id]

