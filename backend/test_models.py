import requests
import os

key = os.environ.get('GEMINI_API_KEY', '')
r = requests.get(f'https://generativelanguage.googleapis.com/v1beta/models?key={key}')
models = r.json().get('models', [])

for m in models:
    name = m['name']
    if 'flash' not in name and 'pro' not in name: 
        continue
    if 'tts' in name or 'image' in name or 'lite' in name:
        continue
        
    print(f"Testing {name}...")
    try:
        r2 = requests.post(
            f'https://generativelanguage.googleapis.com/v1beta/{name}:generateContent?key={key}', 
            json={'contents': [{'parts': [{'text': 'hi'}]}]}
        )
        if r2.status_code == 200:
            print(f'Working model found: {name}')
            break
        else:
            print(f"Failed with {r2.status_code}: {r2.text[:100]}")
    except Exception as e:
        print(f"Exception: {e}")
