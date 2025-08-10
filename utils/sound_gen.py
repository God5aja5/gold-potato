import base64
import requests
import concurrent.futures
from typing import List

def extract_waveforms(data) -> List[bytes]:
    """
    Extract waveform base64 from any ElevenLabs sound-generation API response format.
    Returns list of decoded MP3 bytes.
    """
    waveforms = []

    if "waveforms" in data:
        waveforms = [w.get("waveform_base64") for w in data["waveforms"] if "waveform_base64" in w]

    elif "audio" in data:
        waveforms = [data["audio"]]

    elif "clips" in data:
        for clip in data["clips"]:
            if "audio" in clip:
                waveforms.append(clip["audio"])

    elif "sound_generations_with_waveforms" in data:
        for item in data["sound_generations_with_waveforms"]:
            if "waveform_base_64" in item:
                waveforms.append(item["waveform_base_64"])
            elif "waveform_base64" in item:
                waveforms.append(item["waveform_base64"])

    # Decode to bytes
    audio_bytes_list = []
    for wf in waveforms:
        try:
            audio_bytes_list.append(base64.b64decode(wf))
        except Exception:
            pass

    return audio_bytes_list

def upload_to_catbox(i: int, audio_bytes: bytes) -> str:
    """Upload audio bytes to Catbox and return preview URL."""
    files = {'fileToUpload': (f"sound_{i}.mp3", audio_bytes, 'audio/mpeg')}
    up = requests.post(
        'https://catbox.moe/user/api.php',
        data={'reqtype': 'fileupload'},
        files=files
    )
    if up.status_code == 200 and up.text.startswith('https://'):
        return up.text.strip()
    return f"❌ Upload failed for sound {i}"

def generate_sound_effects(text: str) -> List[str]:
    """
    Generates sounds from ElevenLabs and uploads to Catbox in parallel.
    Returns a list of direct MP3 preview URLs.
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

    # Request sounds
    r = requests.post('https://api.elevenlabs.io/sound-generation',
                      headers=headers, json=payload)

    try:
        data = r.json()
    except Exception:
        raise RuntimeError("❌ Could not parse JSON from ElevenLabs response")

    # Extract audio bytes
    audio_bytes_list = extract_waveforms(data)
    if not audio_bytes_list:
        raise RuntimeError("❌ No waveforms found in API response")

    # Upload in parallel
    urls = []
    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = [
            executor.submit(upload_to_catbox, i + 1, audio_bytes)
            for i, audio_bytes in enumerate(audio_bytes_list)
        ]
        for future in concurrent.futures.as_completed(futures):
            urls.append(future.result())

    return urls

# Example usage:
#if __name__ == "__main__":
#    links = generate_sound_effects("Horror sound")
#    print("\n🎵 Direct preview links:")
#    for link in links:
#        print(link)
