import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from api import upload, analyze, chat, advanced, quick_scan
from middleware.guardrails import GuardrailsMiddleware

app = FastAPI(title="LegalEase AI Backend")

app.add_middleware(GuardrailsMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "LegalEase AI Backend is running"}

app.include_router(upload.router, prefix="/api")
app.include_router(analyze.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(advanced.router, prefix="/api")
app.include_router(quick_scan.router, prefix="/api")
