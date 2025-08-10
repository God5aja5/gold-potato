import re, base64, time, random, requests
from io import BytesIO
from concurrent.futures import ThreadPoolExecutor, as_completed
from .common import generate_user_agent

# ---------- Fal Ultra ----------
def generate_ultra_image(prompt: str) -> str | None:
    try:
        headers = {
            'authority': 'fal-image-generator.vercel.app',
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9',
            'cache-control': 'no-cache',
            'content-type': 'application/json',
            'origin': 'https://fal-image-generator.vercel.app',
            'referer': 'https://fal-image-generator.vercel.app/',
            'user-agent': generate_user_agent(),
        }
        payload = {'prompt': prompt, 'provider': 'fal', 'modelId': 'fal-ai/flux-pro/v1.1-ultra'}
        r = requests.post('https://fal-image-generator.vercel.app/api/generate-images',
                          headers=headers, json=payload, timeout=30)
        if r.status_code != 200:
            return None
        b64 = re.search(r'([A-Za-z0-9+/=]{100,})', r.text).group(1)
        b64 += '=' * (-len(b64) % 4)
        img_bytes = base64.b64decode(b64)

        up = requests.post('https://tmpfiles.org/api/v1/upload',
                           files={'file': ('generated.png', img_bytes)})
        if up.status_code == 200 and up.json().get('data', {}).get('url'):
            return up.json()['data']['url'].replace('tmpfiles.org/', 'tmpfiles.org/dl/')
    except Exception as e:
        print('[ERROR] Ultra generation:', e)
    return None

# ---------- MagicStudio Realistic ----------
def generate_single_realistic_image(prompt: str) -> str | None:
    try:
        hdr = {
            'origin': 'https://magicstudio.com',
            'referer': 'https://magicstudio.com/ai-art-generator/',
            'user-agent': generate_user_agent(),
        }
        data = {
            'prompt': prompt,
            'output_format': 'bytes',
            'anonymous_user_id': str(uuid.uuid4()),
            'request_timestamp': str(time.time()),
            'user_is_subscribed': 'false',
            'client_id': 'pSgX7WgjukXCBoYwDM8G8GLnRRkvAoJlqa5eAVvj95o',
        }
        r = requests.post('https://ai-api.magicstudio.com/api/ai-art-generator',
                          headers=hdr, data=data, timeout=30)
        if r.status_code != 200:
            return None
        up = requests.post('https://0x0.st',
                           files={'file': ('image.png', r.content)},
                           headers={'User-Agent': 'curl/7.64.1'})
        return up.text.strip() if up.status_code == 200 else None
    except Exception as e:
        print('Realistic single error:', e)
        return None

# ---------- Parallel Realistic ----------
def generate_realistic_batch(prompt: str, count: int):
    max_workers = min(random.randint(5, 8), count)
    urls = []
    with ThreadPoolExecutor(max_workers=max_workers) as ex:
        futures = [ex.submit(generate_single_realistic_image, prompt) for _ in range(count)]
        for f in as_completed(futures):
            res = f.result()
            if res:
                urls.append(res)
    return urls

# ---------- Text-to-Video ----------
def generate_single_video(prompt: str) -> str | None:
    try:
        r = requests.get('https://api.yabes-desu.workers.dev/ai/tool/txt2video',
                         params={'prompt': prompt}, timeout=60)
        data = r.json()
        if data.get('success') and 'url' in data:
            return data['url']
    except Exception as e:
        print('Single video error:', e)
    return None

def generate_videos_batch(prompt: str, count: int):
    max_workers = min(random.randint(3, 5), count)
    urls = []
    with ThreadPoolExecutor(max_workers=max_workers) as ex:
        futures = [ex.submit(generate_single_video, prompt) for _ in range(count)]
        for f in as_completed(futures):
            res = f.result()
            if res:
                urls.append(res)
    return urls