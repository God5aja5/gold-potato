import requests
import uuid

def generate_sound_effects(text: str, duration: int = 5) -> dict:
    """
    Uses AudioX API → returns {url: str, seed: int}
    """
    if not (1 <= duration <= 10):
        duration = 5

    s = requests.Session()
    s.headers.update({
        'authority': 'audiox.app',
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        'content-type': 'application/json',
        'origin': 'https://audiox.app',
        'pragma': 'no-cache',
        'referer': 'https://audiox.app/sound-effects',
        'sec-ch-ua': '"Chromium";v="137"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
    })

    payload = {
        'prompt': text,
        'negativePrompt': '',
        'duration': duration,
    }

    r = s.post('https://audiox.app/api/sound-effects', json=payload)
    data = r.json()

    if data.get('status') == 'success':
        return {'url': data['audio_url'], 'seed': data['seed']}
    return {'url': None, 'seed': None}
