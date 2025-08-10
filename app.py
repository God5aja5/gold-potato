from flask import Flask, render_template, request, jsonify
from utils.image_gen import (
    generate_ultra_image,
    generate_realistic_batch,
    generate_videos_batch,
)
from utils.sound_gen import generate_sound_effects

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_ultra', methods=['POST'])
def ultra():
    prompt = request.json.get('prompt')
    if not prompt:
        return jsonify({'error': 'Prompt required'}), 400
    url = generate_ultra_image(prompt)
    return jsonify({'imageUrl': url}) if url else jsonify({'error': 'Failed'}), 500

@app.route('/generate_realistic_batch', methods=['POST'])
def realistic_batch():
    prompt = request.json.get('prompt')
    count = request.json.get('count', 1)
    if not prompt:
        return jsonify({'error': 'Prompt required'}), 400
    urls = generate_realistic_batch(prompt, count)
    return jsonify({'images': urls}) if urls else jsonify({'error': 'Failed'}), 500

@app.route('/generate_videos_batch', methods=['POST'])
def video_batch():
    prompt = request.json.get('prompt')
    count = request.json.get('count', 1)
    if not prompt:
        return jsonify({'error': 'Prompt required'}), 400
    urls = generate_videos_batch(prompt, count)
    return jsonify({'videos': urls}) if urls else jsonify({'error': 'Failed'}), 500

@app.route('/generate_sounds', methods=['POST'])
def sounds():
    text    = request.json.get('text')
    seconds = min(max(request.json.get('duration', 5), 1), 10)
    if not text:
        return jsonify({'error': 'Text required'}), 400
    data = generate_sound_effects(text, seconds)
    if data['url']:
        return jsonify({'audioUrl': data['url'], 'seed': data['seed']})
    return jsonify({'error': 'Failed'}), 500

application = app  # for Vercel
