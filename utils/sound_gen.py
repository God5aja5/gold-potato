import base64, json, requests
from typing import List

def generate_sound_effects(text: str) -> List[str]:
    """
    Returns a list of 4 direct Catbox MP3 URLs.
    """
    headers = {
        'authority': 'api.elevenlabs.io',
        'accept': '*/*',
        'content-type': 'application/json',
        'origin': 'https://elevenlabs.io',
        'referer': 'https://elevenlabs.io/',
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
    }
    payload = {'text': text}
    r = requests.post('https://api.elevenlabs.io/sound-generation',
                      headers=headers, json=payload)
    data = r.json()

    urls = []
    for idx, sound in enumerate(data['sound_generations_with_waveforms'], 1):
        b64_audio = sound['waveform_base_64']
        audio_bytes = base64.b64decode(b64_audio)
        fname = f"sound_{idx}.mp3"

        # Upload to catbox
        up = requests.post('https://catbox.moe/user/api.php',
                           data={'reqtype': 'fileupload'},
                           files={'fileToUpload': (fname, audio_bytes, 'audio/mpeg')})
        if up.status_code == 200 and up.text.startswith('https://'):
            urls.append(up.text.strip())
        else:
            urls.append('❌ Upload failed')
    return urls