/* ========= GLOBALS ========= */
let generatedImagesArting   = [];
let generatedImagesRealistic= [];
let generatedVideos         = [];
let generatedUltraImage     = '';
let generatedAudioUrl       = '';
let generatedSeed           = '';

/* ========= TAB SWITCH ========= */
function switchTab(tabName) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.generator-section').forEach(s => s.classList.remove('active'));
  document.querySelector(`.tab[onclick="switchTab('${tabName}')"]`).classList.add('active');
  document.getElementById(tabName).classList.add('active');
}

/* ========= ULTRA IMAGE ========= */
async function generateUltraGen() {
  const prompt = document.getElementById('promptUltra').value.trim();
  if (!prompt) { alert('Enter prompt'); return; }

  const loader   = document.getElementById('loaderUltra');
  const progress = document.getElementById('progressUltra');
  const result   = document.getElementById('resultUltra');
  const btn      = event.target;
  const container= document.getElementById('imageContainerUltra');

  loader.style.display = 'block';
  progress.style.display = 'block';
  result.style.display = 'none';
  btn.disabled = true;
  container.innerHTML = '';

  progress.textContent = 'Generating ultra image...';

  try {
    const res = await fetch('/generate_ultra', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    if (data.imageUrl) {
      generatedUltraImage = data.imageUrl;
      container.innerHTML = `<img src="${data.imageUrl}" alt="Ultra" class="generated-image">`;
      result.style.display = 'block';
      progress.textContent = 'Done!';
    } else throw 'fail';
  } catch {
    alert('Error');
    progress.style.display = 'none';
  } finally {
    loader.style.display = 'none';
    btn.disabled = false;
  }
}

/* ========= UNCENSORED / REALISTIC ========= */
async function generateImages(type) {
  const promptId = type === 'arting' ? 'prompt1' : 'prompt2';
  const countId  = type === 'arting' ? 'imageCount1' : 'imageCount2';
  const loaderId = type === 'arting' ? 'loader1' : 'loader2';
  const progressId = type === 'arting' ? 'progress1' : 'progress2';
  const resultId = type === 'arting' ? 'result1' : 'result2';
  const containerId = type === 'arting' ? 'imageContainer1' : 'imageContainer2';

  const prompt = document.getElementById(promptId).value.trim();
  const count  = parseInt(document.getElementById(countId).value) || 1;
  if (!prompt) { alert('Enter prompt'); return; }

  const loader   = document.getElementById(loaderId);
  const progress = document.getElementById(progressId);
  const result   = document.getElementById(resultId);
  const btn      = event.target;
  const container= document.getElementById(containerId);

  loader.style.display = 'block';
  progress.style.display = 'block';
  result.style.display = 'none';
  btn.disabled = true;
  container.innerHTML = '';

  if (type === 'arting') generatedImagesArting = [];
  else generatedImagesRealistic = [];

  try {
    const endpoint = type === 'realistic' ? '/generate_realistic_batch' : '/generate';
    const payload  = type === 'realistic' ? { prompt, count } : { prompt };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    const urls = type === 'realistic' ? data.images : [data.imageUrl];
    if (urls && urls.length) {
      urls.forEach((url, i) => addImage(url, i + 1, container));
      if (type === 'realistic') generatedImagesRealistic = urls;
      else generatedImagesArting = urls;
      result.style.display = 'block';
      progress.textContent = `${urls.length} image(s) ready!`;
    } else throw 'fail';
  } catch {
    alert('Error');
    progress.style.display = 'none';
  } finally {
    loader.style.display = 'none';
    btn.disabled = false;
  }
}

/* ========= VIDEOS ========= */
async function generateVideos() {
  const prompt = document.getElementById('prompt3').value.trim();
  const count  = parseInt(document.getElementById('videoCount').value) || 1;
  if (!prompt) { alert('Enter prompt'); return; }

  const loader   = document.getElementById('loader3');
  const progress = document.getElementById('progress3');
  const result   = document.getElementById('result3');
  const btn      = event.target;
  const container= document.getElementById('videoContainer');

  loader.style.display = 'block';
  progress.style.display = 'block';
  result.style.display = 'none';
  btn.disabled = true;
  container.innerHTML = '';
  generatedVideos = [];

  try {
    const res = await fetch('/generate_videos_batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, count })
    });
    const data = await res.json();
    if (data.videos && data.videos.length) {
      generatedVideos = data.videos;
      data.videos.forEach((url, i) => addVideo(url, i + 1, container));
      result.style.display = 'block';
      progress.textContent = `${data.videos.length} video(s) ready!`;
    } else throw 'fail';
  } catch {
    alert('Error');
    progress.style.display = 'none';
  } finally {
    loader.style.display = 'none';
    btn.disabled = false;
  }
}

/* ========= SOUND EFFECTS ========= */
async function generateSounds() {
  let seconds = parseInt(document.getElementById('durationSFX').value) || 5;
  if (seconds > 10) {
    alert('Sad 🤡🫵 Limit reached! Maximum allowed is 10 seconds. ');
    return;
  }
  seconds = Math.max(seconds, 1);           // floor to 1
  const text = document.getElementById('promptSFX').value.trim();
  if (!text) { alert('Enter text'); return; }

  const loader   = document.getElementById('loaderSFX');
  const progress = document.getElementById('progressSFX');
  const result   = document.getElementById('resultSFX');
  const btn      = event.target;
  const container= document.getElementById('soundContainer');

  loader.style.display = 'block';
  progress.style.display = 'block';
  result.style.display = 'none';
  btn.disabled = true;
  container.innerHTML = '';

  progress.textContent = 'Generating sound...';

  try {
    const res = await fetch('/generate_sounds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, duration: seconds })
    });
    const data = await res.json();
    if (data.audioUrl) {
      generatedAudioUrl = data.audioUrl;
      generatedSeed     = data.seed;
      container.innerHTML = `
        <audio controls style="width:100%;margin-bottom:10px;">
          <source src="${data.audioUrl}" type="audio/wav">
        </audio>
        <p style="color:#4ecdc4;">Seed: ${data.seed}</p>
        <button class="btn download-btn" onclick="downloadSingleSound('${data.audioUrl}', 1)">
          Download Sound
        </button>`;
      result.style.display = 'block';
    } else throw 'fail';
  } catch {
    alert('Error');
    progress.style.display = 'none';
  } finally {
    loader.style.display = 'none';
    btn.disabled = false;
  }
}

/* ========= HELPERS ========= */
function addImage(url, idx, container) {
  const div = document.createElement('div');
  div.className = 'image-item';
  div.innerHTML = `
    <img src="${url}" class="generated-image">
    <button class="btn download-btn" onclick="downloadSingleImage('${url}', ${idx})">Download Image ${idx}</button>`;
  container.appendChild(div);
}
function addVideo(url, idx, container) {
  const div = document.createElement('div');
  div.className = 'video-item';
  div.innerHTML = `
    <video controls class="generated-video">
      <source src="${url}" type="video/mp4">
    </video>
    <button class="btn download-video-btn" onclick="downloadSingleVideo('${url}', ${idx})">Download Video ${idx}</button>`;
  container.appendChild(div);
}
function downloadSingleImage(url, idx) {
  const a = document.createElement('a');
  a.href = url; a.download = `image_${idx}.png`; a.target = '_blank';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}
function downloadSingleVideo(url, idx) {
  const a = document.createElement('a');
  a.href = url; a.download = `video_${idx}.mp4`; a.target = '_blank';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}
function downloadAllImages(type) {
  const arr = type === 'arting' ? generatedImagesArting : generatedImagesRealistic;
  arr.forEach((url, i) => setTimeout(() => downloadSingleImage(url, i + 1), i * 1000));
}
function downloadAllVideos() {
  generatedVideos.forEach((url, i) => setTimeout(() => downloadSingleVideo(url, i + 1), i * 1000));
}
function resetForm(type) {
  if (type === 'ultra') {
    document.getElementById('promptUltra').value = '';
    document.getElementById('resultUltra').style.display = 'none';
    document.getElementById('progressUltra').style.display = 'none';
    document.getElementById('imageContainerUltra').innerHTML = '';
    generatedUltraImage = '';
  } else if (type === 'sfx') {
    document.getElementById('promptSFX').value = '';
    document.getElementById('durationSFX').value = '5';
    document.getElementById('resultSFX').style.display = 'none';
    document.getElementById('progressSFX').style.display = 'none';
    document.getElementById('soundContainer').innerHTML = '';
  } else if (type === 'video') {
    document.getElementById('prompt3').value = '';
    document.getElementById('videoCount').value = '1';
    document.getElementById('result3').style.display = 'none';
    document.getElementById('progress3').style.display = 'none';
    document.getElementById('videoContainer').innerHTML = '';
    generatedVideos = [];
  } else {
    const ids = type === 'arting'
      ? ['prompt1', 'imageCount1', 'result1', 'progress1', 'imageContainer1']
      : ['prompt2', 'imageCount2', 'result2', 'progress2', 'imageContainer2'];
    document.getElementById(ids[0]).value = '';
    document.getElementById(ids[1]).value = '1';
    document.getElementById(ids[2]).style.display = 'none';
    document.getElementById(ids[3]).style.display = 'none';
    document.getElementById(ids[4]).innerHTML = '';
    if (type === 'arting') generatedImagesArting = [];
    else generatedImagesRealistic = [];
  }
}
function handleChatKeyPress(e) { if (e.key === 'Enter') sendMessage(); }
function sendMessage() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;
  const msgs = document.getElementById('chatMessages');
  msgs.innerHTML += `<div class="message user-message"><div>${msg}</div></div>`;
  msgs.innerHTML += `<div class="message bot-message"><div>AI: ${msg}</div></div>`;
  input.value = '';
  msgs.scrollTop = msgs.scrollHeight;
}
