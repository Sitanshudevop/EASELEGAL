import requests
import time
import uuid

BASE_URL = "http://127.0.0.1:8000"

def main():
    print("Uploading file...")
    # create dummy file
    files = {'file': ('test.txt', b'This is a sample non-disclosure agreement. Confidential info shall not be shared. No cap on liability.')}
    upload_res = requests.post(f"{BASE_URL}/api/upload", files=files)
    
    if upload_res.status_code != 200:
        print(f"Upload failed: {upload_res.status_code} - {upload_res.text}")
        return
        
    data = upload_res.json()
    session_id = data.get("session_id")
    print(f"Upload successful. Session ID: {session_id}")
    
    print("Analyzing document...")
    analyze_payload = {
        "session_id": session_id,
        "persona": "Lawyer",
        "jurisdiction": "US - General",
        "language": "English"
    }
    
    analyze_res = requests.post(f"{BASE_URL}/api/analyze", json=analyze_payload)
    if analyze_res.status_code != 200:
        print(f"Analyze failed: {analyze_res.status_code} - {analyze_res.text}")
        return
        
    print("Analyze successful!")
    print(analyze_res.json())

if __name__ == "__main__":
    main()
