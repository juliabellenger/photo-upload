import { initializeApp }                          from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getStorage, ref, uploadBytesResumable } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const { storagePrefix, firebaseConfig, successMessage } = window.UPLOAD_CONFIG;

// ── Firebase ──────────────────────────────────────────────────────────────────
const app     = initializeApp(firebaseConfig);
const storage = getStorage(app);

// ── DOM refs ──────────────────────────────────────────────────────────────────
let selectedFiles = [];

const fileInput    = document.getElementById('file-input');
const cameraInput  = document.getElementById('camera-input');
const dropZone     = document.getElementById('drop-zone');
const previewSec   = document.getElementById('preview-section');
const previewGrid  = document.getElementById('preview-grid');
const previewCount = document.getElementById('preview-count');
const uploadBtn    = document.getElementById('upload-btn');

document.getElementById('success-message').innerHTML = successMessage;

// ── Button wiring ─────────────────────────────────────────────────────────────
document.getElementById('gallery-btn').addEventListener('click', e => {
  e.stopPropagation();
  fileInput.click();
});
document.getElementById('camera-btn-trigger').addEventListener('click', e => {
  e.stopPropagation();
  cameraInput.click();
});
uploadBtn.addEventListener('click', startUpload);
document.getElementById('upload-more-btn').addEventListener('click', resetUploader);

// ── File handling ─────────────────────────────────────────────────────────────
function handleFiles(files) {
  const imgs = Array.from(files).filter(f => f.type.startsWith('image/'));
  if (!imgs.length) return;
  selectedFiles = [...selectedFiles, ...imgs];
  renderPreviews();
}

function renderPreviews() {
  previewGrid.innerHTML = '';
  selectedFiles.forEach((file, idx) => {
    const thumb = document.createElement('div');
    thumb.className = 'preview-thumb';
    thumb.id = `thumb-${idx}`;

    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.alt = file.name;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '✕';
    removeBtn.onclick = () => { selectedFiles.splice(idx, 1); renderPreviews(); };

    thumb.appendChild(img);
    thumb.appendChild(removeBtn);
    previewGrid.appendChild(thumb);
  });

  const n = selectedFiles.length;
  previewCount.textContent = n === 1 ? '1 Photo Selected' : `${n} Photos Selected`;
  previewSec.style.display  = n ? 'block' : 'none';
  uploadBtn.style.display   = n ? 'block' : 'none';
  document.getElementById('error-banner').style.display = 'none';
}

fileInput.addEventListener('change',   e => handleFiles(e.target.files));
cameraInput.addEventListener('change', e => handleFiles(e.target.files));

dropZone.addEventListener('dragover',  e => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', ()  => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  handleFiles(e.dataTransfer.files);
});

// ── Upload ────────────────────────────────────────────────────────────────────
async function startUpload() {
  if (!selectedFiles.length) return;

  uploadBtn.disabled = true;
  document.getElementById('progress-container').style.display = 'block';
  document.getElementById('error-banner').style.display = 'none';

  const total = selectedFiles.length;
  let done = 0, failed = 0;

  function updateProgress() {
    const pct = Math.round((done / total) * 100);
    document.getElementById('progress-bar').style.width = pct + '%';
    document.getElementById('progress-label').textContent =
      `Uploading ${done} of ${total} photo${total > 1 ? 's' : ''}…`;
  }

  function markThumb(idx, icon) {
    const thumb = document.getElementById(`thumb-${idx}`);
    if (!thumb) return;
    const existing = thumb.querySelector('.upload-status');
    if (existing) existing.remove();
    const status = document.createElement('div');
    status.className = 'upload-status';
    status.textContent = icon;
    thumb.appendChild(status);
  }

  updateProgress();

  const CONCURRENCY = 6;
  const queue = selectedFiles.map((file, idx) => ({ file, idx }));
  let active = 0;

  await new Promise(resolve => {
    function tryNext() {
      if (queue.length === 0 && active === 0) { resolve(); return; }
      while (queue.length > 0 && active < CONCURRENCY) {
        const { file, idx } = queue.shift();
        active++;
        uploadOne(file, idx)
          .then(ok => { if (ok) markThumb(idx, '✅'); else { markThumb(idx, '❌'); failed++; } })
          .catch(()  => { markThumb(idx, '❌'); failed++; })
          .finally(() => { done++; active--; updateProgress(); tryNext(); });
      }
    }
    tryNext();
  });

  if (failed === 0) {
    document.getElementById('upload-area').style.display = 'none';
    document.getElementById('success-screen').style.display = 'block';
  } else {
    uploadBtn.disabled = false;
    const errBanner = document.getElementById('error-banner');
    errBanner.style.display = 'block';
    errBanner.textContent = `${failed} photo(s) failed to upload. Please try again.`;
  }
}

function uploadOne(file, idx) {
  return new Promise((resolve) => {
    const date     = new Date().toISOString().slice(0, 10);
    const safeName = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const storageRef = ref(storage, `${storagePrefix}/${date}/${safeName}`);

    const task = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
      customMetadata: { originalName: file.name }
    });

    task.on('state_changed', null,
      () => resolve(false),
      () => resolve(true)
    );
  });
}

function resetUploader() {
  selectedFiles = [];
  fileInput.value = '';
  cameraInput.value = '';
  previewGrid.innerHTML = '';
  previewSec.style.display  = 'none';
  uploadBtn.style.display   = 'none';
  uploadBtn.disabled        = false;
  document.getElementById('progress-container').style.display = 'none';
  document.getElementById('progress-bar').style.width = '0%';
  document.getElementById('success-screen').style.display = 'none';
  document.getElementById('upload-area').style.display = 'block';
}
