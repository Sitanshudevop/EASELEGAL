import requests
import json
import time
import os

BASE_URL = "http://localhost:8000/api"

def test_endpoints():
    print("Testing /upload...")
    # Create a mock text file
    files = {'file': ('contract.txt', 'This is a sample rental agreement contract for John Doe. Phone: 555-123-4567. Email: john@example.com.', 'text/plain')}
    res_upload = requests.post(f"{BASE_URL}/upload", files=files)
    assert res_upload.status_code == 200, f"Upload failed: {res_upload.text}"
    session_id = res_upload.json()['session_id']
    print(f"Upload success! Session ID: {session_id}")
    
    print("Testing /analyze...")
    res_analyze = requests.post(f"{BASE_URL}/analyze", json={"session_id": session_id, "persona": "tenant"})
    assert res_analyze.status_code == 200, f"Analyze failed: {res_analyze.text}"
    print("Analyze success!")
    
    print("Testing /chat...")
    res_chat = requests.post(f"{BASE_URL}/chat", json={"session_id": session_id, "question": "What is the document about?"})
    assert res_chat.status_code == 200, f"Chat failed: {res_chat.text}"
    print("Chat success!")
    
    print("Testing /extract-timeline...")
    res_timeline = requests.post(f"{BASE_URL}/extract-timeline", json={"session_id": session_id})
    assert res_timeline.status_code == 200, f"Timeline failed: {res_timeline.text}"
    print("Timeline success!")
    
    print("Testing /generate-dossier...")
    res_dossier = requests.post(f"{BASE_URL}/generate-dossier", json={"session_id": session_id})
    assert res_dossier.status_code == 200, f"Dossier failed: {res_dossier.text}"
    print("Dossier success!")

    print("Testing /quick-scan...")
    res_quick = requests.post(f"{BASE_URL}/quick-scan", json={"text": "A simple contract snippet."})
    assert res_quick.status_code == 200, f"Quick scan failed: {res_quick.text}"
    print("Quick scan success!")

    print("All backend endpoints verified successfully (HTTP 200)!")

if __name__ == "__main__":
    test_endpoints()
