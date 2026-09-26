import os
import json
import requests
from typing import List, Optional

api_key = os.getenv("GEMINI_API_KEY", "")

import requests

def _call_gemini_rest(prompt: str, schema_name: str, schema_dict: dict) -> str:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return "{}"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={api_key.strip()}" # Fix explicitly verified # trigger deployment
    
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": schema_dict,
            "temperature": 0.1,
            "maxOutputTokens": 2048
        }
    }
    
    if not schema_dict:
        payload["generationConfig"] = {
            "responseMimeType": "text/plain",
            "temperature": 0.1,
            "maxOutputTokens": 2048
        }
        
    for attempt in range(2):
        try:
            response = requests.post(url, json=payload, headers={'Content-Type': 'application/json'}, timeout=300)
            response.raise_for_status()
            data = response.json()
            print("GEMINI API RAW JSON:", json.dumps(data, indent=2))
            
            candidates = data.get("candidates", [])
            if not candidates:
                return "{}"
                
            text = candidates[0].get("content", {}).get("parts", [])
            if not text:
                return "{}"
                
            return text[0].get("text", "{}")
        except requests.exceptions.Timeout as e:
            print(f"Gemini API Timeout on attempt {attempt + 1}: {e}")
            if attempt == 1:
                from fastapi import HTTPException
                raise HTTPException(status_code=504, detail="Upstream LLM Timeout after retries")
        except Exception as e:
            print(f"Gemini API Error: {e}")
            raise
            
    return "{}"

# Schemas
analysis_schema = {
    "type": "OBJECT",
    "properties": {
        "doc_type": {"type": "STRING"},
        "summary": {"type": "STRING"},
        "clauses": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "text": {"type": "STRING"},
                    "type": {"type": "STRING"},
                    "risk_level": {"type": "STRING", "description": "HIGH, MEDIUM, LOW, or INFO"},
                    "explanation": {"type": "STRING"},
                    "source_span": {"type": "STRING"},
                    "deviation_note": {"type": "STRING"},
                    "negotiation_tip": {"type": "STRING"}
                }
            }
        },
        "jargon_glossary": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "term": {"type": "STRING"},
                    "definition": {"type": "STRING"}
                }
            }
        }
    }
}

chat_schema = {
    "type": "OBJECT",
    "properties": {
        "answer": {"type": "STRING"},
        "confidence_score": {"type": "STRING", "description": "HIGH, MED, or LOW"},
        "citations": {
            "type": "ARRAY",
            "items": {"type": "STRING"}
        }
    }
}

timeline_schema = {
    "type": "OBJECT",
    "properties": {
        "events": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "date_description": {"type": "STRING"},
                    "event_name": {"type": "STRING"},
                    "obligation": {"type": "STRING"}
                }
            }
        }
    }
}

def analyze_document(text: str, persona: Optional[str] = None, jurisdiction: str = "US - General", language: str = "English") -> str:
    prompt = f"Analyze the following document. First, if the document is NOT a legal contract, agreement, policy, or legal document, immediately return doc_type as 'NON_LEGAL_DOCUMENT' and leave other fields empty.\n"
    prompt += f"Extract its type, a summary, key clauses with risk levels, and a jargon glossary.\n"
    prompt += f"Limit risk clause explanations to 2 sentences maximum. Do not extract low-priority clauses. Optimize for extreme JSON generation speed.\n"
    prompt += f"For each flagged clause, compare it against a 'typical/fair' baseline for this document type (e.g. rental agreement, NDA, etc.). Use the 'deviation_note' field to explain if it is unusually one-sided (e.g. 'most agreements of this type cap X at Y; this one has no cap').\n"
    if persona:
        prompt += f"Analyze this specifically from the perspective of a {persona}. Adjust risk levels and explanations accordingly.\n"
    prompt += f"Note that laws vary by jurisdiction. Analyze this with {jurisdiction} in mind, and explicitly mention in your explanations that 'laws vary by jurisdiction'.\n"
    prompt += f"Generate the summary, explanations, and jargon glossary in {language} language.\n"
    prompt += f"\nDocument Text:\n{text[:4000]}"
    return _call_gemini_rest(prompt, "AnalysisResult", analysis_schema)

def chat_rag(text: str, question: str, jurisdiction: str = "US - General", language: str = "English") -> str:
    prompt = f"If the user asks for advice on an active personal legal situation (e.g. 'what should I do about my court case', 'how do I sue'), reply exactly with: 'Please consult a qualified professional. I cannot provide advice on active personal legal situations.'\n"
    prompt += f"Otherwise, based ONLY on the following document, answer the question. If uncertain, state 'uncertain' and set confidence LOW.\n"
    prompt += f"Note that laws vary by jurisdiction. Answer with {jurisdiction} in mind.\n"
    prompt += f"Answer in {language} language.\n"
    prompt += f"\nDocument:\n{text[:4000]}\n\nQuestion:\n{question}"
    return _call_gemini_rest(prompt, "ChatResponse", chat_schema)

def extract_timeline_events(text: str) -> str:
    prompt = f"Extract date-bound obligations (notice periods, renewal windows, payment due dates) from the document.\n\nDocument:\n{text[:4000]}"
    return _call_gemini_rest(prompt, "TimelineResult", timeline_schema)

def simulate_scenario(text: str, scenario: str) -> str:
    prompt = f"Based on the document, explain what happens in the following scenario: {scenario}\nKeep it in plain language. Start your response with: 'Illustrative scenario, not legal advice.'\n\nDocument:\n{text[:4000]}"
    return _call_gemini_rest(prompt, "", None)

diff_schema = {
    "type": "OBJECT",
    "properties": {
        "changes": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "type": {"type": "STRING", "description": "INSERTION, DELETION, or MODIFICATION"},
                    "old_text": {"type": "STRING", "description": "The text from the original document (if any)"},
                    "new_text": {"type": "STRING", "description": "The text from the new document (if any)"},
                    "explanation": {"type": "STRING", "description": "Plain English explanation of what this change means for the parties"}
                }
            }
        }
    }
}

def compare_documents(text1: str, text2: str) -> str:
    prompt = f"Compare Document 1 (Original) and Document 2 (New). Identify the key insertions, deletions, and modifications. Explain each change in plain language and what it means for the parties.\n\nDocument 1 (Original):\n{text1[:4000]}\n\nDocument 2 (New):\n{text2[:4000]}"
    return _call_gemini_rest(prompt, "DiffResult", diff_schema)
