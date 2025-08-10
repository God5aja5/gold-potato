let generatedImagesArting = [];
let generatedImagesRealistic = [];
let generatedVideos = [];
let generatedUltraImage = '';
let chatHistory = [];

function switchTab(tabName) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.generator-section').forEach(s => s.classList.remove('active'));
  document.querySelector(`.tab[onclick="switchTab('${tabName}')"]`).classList.add('active');
  document.getElementById(tabName).classList.add('active');
}

/* ========= ULTRA ========= */
async function generateUltraGen() {
  const prompt = document.getElementById('promptUltra').value.trim();
  if (!prompt) { alert('Please enter a prompt!'); return; }

  const loader = document.getElementById('loaderUltra');
  const progress = document.getElementById('progressUltra');
  const result = document.getElementById('resultUltra');
  const btn = event.target;
  const container = document.getElementById('imageContainerUltra');

  loader.style.display = 'block';
  progress.style.display = 'block';
  result.style.display = 'none';
  btn.disabled = true;
  container.innerHTML = '';

  progress.textContent = 'Processing ultra generation...';

  try {
    const res = await fetch('/generate_ultra', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    if (data.imageUrl) {
      generatedUltraImage = data.imageUrl;
      container.innerHTML = `<img src="${data.imageUrl}" class="generated-image">`;
      result.style.display = 'block';
      progress.textContent = 'Ultra image generated!';
    } else {
      alert('Failed to generate ultra image.');
      progress.style.display = 'none';
    }
  } catch (e) {
    alert(e);
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
    if (type === 'realistic') {
      const res = await fetch('/generate_realistic_batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, count })
      });
      const data = await res.json();
      if (data.images) {
        generatedImagesRealistic = data.images;
        data.images.forEach((url, i) => addImage(url, i + 1, container));
        result.style.display = 'block';
        progress.textContent = `${data.images.length} images ready!`;
      } else throw 'fail';
    } else {
      for (let i = 0; i < count; i++) {
        progress.textContent = `Generating image ${i + 1}/${count}...`;
        const res = await fetch('/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        const data = await res.json();
        if (data.imageUrl) {
          generatedImagesArting.push(data.imageUrl);
          addImage(data.imageUrl, i + 1, container);
        }
      }
      result.style.display = 'block';
      progress.textContent = `${generatedImagesArting.length} images ready!`;
    }
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
    if (data.videos) {
      generatedVideos = data.videos;
      data.videos.forEach((url, i) => addVideo(url, i + 1, container));
      result.style.display = 'block';
      progress.textContent = `${data.videos.length} videos ready!`;
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

  progress.textContent = 'Generating 4 sounds...';

  try {
    const res = await fetch('/generate_sounds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    if (data.sounds) {
      data.sounds.forEach((url, i) => {
        const div = document.createElement('div');
        div.className = 'image-item';
        div.innerHTML = `
          <audio controls style="width:100%;margin-bottom:10px;">
            <source src="${url}" type="audio/mpeg">
          </audio>
          <button class="btn download-btn" onclick="downloadSingleSound('${url}', ${i+1})">
            Download Sound ${i+1}
          </button>`;
        container.appendChild(div);
      });
      result.style.display = 'block';
      progress.textContent = '✅ All 4 sounds ready!';
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
    <button class="btn download-btn" onclick="downloadSingleImage('${url}', ${idx})">
      Download Image ${idx}
    </button>`;
  container.appendChild(div);
}
function addVideo(url, idx, container) {
  const div = document.createElement('div');
  div.className = 'video-item';
  div.innerHTML = `
    <video controls class="generated-video">
      <source src="${url}" type="video/mp4">
    </video>
    <button class="btn download-video-btn" onclick="downloadSingleVideo('${url}', ${idx})">
      Download Video ${idx}
    </button>`;
  container.appendChild(div);
}
function downloadSingleImage(url, idx) {
  const a = document.createElement('a');
  a.href = url;
  a.download = `image_${idx}.png`;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
function downloadSingleVideo(url, idx) {
  const a = document.createElement('a');
  a.href = url;
  a.download = `video_${idx}.mp4`;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
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
function handleChatKeyPress(e) {
  if (e.key === 'Enter') sendMessage();
}
function sendMessage() {
  /* chat stub: simply echo */
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;
  const msgs = document.getElementById('chatMessages');
  msgs.innerHTML += `<div class="message user-message"><div>${msg}</div></div>`;
  msgs.innerHTML += `<div class="message bot-message"><div>AI: ${msg}</div></div>`;
  input.value = '';
  msgs.scrollTop = msgs.scrollHeight;
}
