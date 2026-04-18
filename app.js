'use strict';

// ─── State ───────────────────────────────────────────────
let players = [];
let gage = '';
let pendingPhoto = null;
let cameraStream = null;

// Touch state
let touchPlayerMap = new Map(); // touchId → playerIndex
let placedOrder = [];           // playerIndex[] in order of placement
let countdownRunning = false;
let countdownGeneration = 0;
let winnerIndex = -1;
let currentRevealText = '';

// ─── Constants ───────────────────────────────────────────
const PLAYER_COLORS = [
  '#e63946', '#4ea8de', '#57cc99', '#ffd166',
  '#c77dff', '#ff9f1c', '#2ec4b6', '#ff6b9d'
];

const VOICE_VARIANTS = [
  "Bas sale merde de {player} ! Tu vas devoir {action} !",
  "C'est toi {player} ! Espèce de raté fini, tu vas devoir {action} !",
  "{player} t'as pas eu de bol mon pote ! Tu vas devoir {action} !",
  "HAHAHA ! {player} tu te croyais tranquille ? Raté ! Tu vas devoir {action} !",
  "Aïe aïe aïe {player}... Le destin t'a choisi pour {action} !",
  "{player} c'est toi le bouffon ce soir ! Mission : {action} !",
  "Non mais regardez qui c'est ! {player} le pauvre con ! Tu vas devoir {action} !",
  "Bim ! {player} dans la gueule ! Ton gage : {action} !",
  "LE DESTIN A PARLÉ ! {player} tu vas devoir {action} ! Pas de pitié, zéro !",
  "{player} tu croyais t'en sortir ? Même pas en rêve sale nul ! {action} rien que pour toi !",
  "Oh le boulard pour {player} ! T'as plus qu'à faire {action}, pauvre cloche !",
  "Incroyable mais vrai ! C'est {player} le grand perdant du soir ! Tu dois {action} maintenant !",
  "Le sort en est jeté {player}... tu vas devoir {action}. Et t'as intérêt !",
  "LOOOOSER ! {player} ! Tu vas {action} et tu vas le faire avec le sourire, gros nul !",
  "C'est avec une immense joie que je vous annonce que {player} va devoir {action} ! Quelle honte !",
  "{player}... mon ami... tu vas souffrir. Tu vas devoir {action}. Désolé pas désolé du tout.",
  "Le doigt du destin a choisi {player} ! Mission : {action} ! T'as aucune chance d'y échapper.",
  "Oh non oh non oh non... {player} ! Tu dois {action}. Pourquoi toi ? Parce que t'es nul voilà !",
  "Petite dédicace à {player} qui va devoir {action} ! Courage à toi, âme damnée !",
  "Et c'est {player} qui écope du gage ! {action} ! Allez on y croit... non on y croit pas du tout !",
  "{player} t'aurais mieux fait de rester chez toi ce soir. {action}. Bonne chance sale perdant !",
  "{player} {player} {player}... Le karma a tout vu et t'a pas raté. Tu dois {action}. Bien fait !",
  "Une pensée émue pour {player} qui va devoir {action}. Les autres vous remercient du fond du cœur.",
  "Ambiance... {player} ton heure est venue ! {action} immédiatement et sans rechigner !",
  "Statistiquement {player}, t'avais autant de chances que les autres. Et pourtant. {action}. Énorme.",
  "Oh putain mais c'est {player} ! J'y crois pas ! T'es vraiment le plus nul ! Tu dois {action} !",
  "HONTE ! HONTE ! HONTE ! {player} tu vas devoir {action} devant tout le monde comme le bouffon que t'es !",
  "Verdict du tribunal des amis : {player} est coupable d'être nul. Peine : {action}. Sans appel.",
  "{player} sors ton plus beau sourire parce que tu vas devoir {action} ! Et on va tous regarder !",
  "Dis-moi {player}, t'avais prévu quoi ce soir ? Parce que maintenant t'as {action} au programme !",
  "Franchement {player} même ton chien aurait honte de toi là. {action}. Allez !",
  "C'est bon {player} arrête de pleurer, tu dois {action}. Les larmes ça change rien ici !",
  "Trois, deux, un... et c'est {player} qui se prend {action} dans la face ! Magnifique !",
  "{player} tu viens de perdre le pari de ta vie. Ton gage : {action}. T'es vraiment pas chanceux !",
  "Toute la honte sur {player} ! Toute la honte ! {action} et vite fait bien fait !",
  "Le roi des loosers de la soirée s'appelle {player} ! Applaudissements ! Et maintenant : {action} !",
  "On a un gagnant... enfin un perdant ! {player} ! La totale ! Tu dois {action} ! C'est cadeau !",
  "{player} je vais être honnête avec toi, on s'y attendait tous un peu. {action}. Allez hop !",
  "Personne n'est surpris. Vraiment personne. {player} tu dois {action} et c'est bien mérité !",
  "Ha ha ha ! {player} t'as cru ? T'as vraiment cru t'en sortir ? {action} ! Et remercie encore !",
  "Message de l'univers pour {player} : t'es nul, t'as perdu, tu dois {action}. Bonne journée !",
  "{player} si t'avais un euro à chaque fois que tu perdes, là tu devrais {action} et t'aurais toujours rien !",
  "Extraordinaire. Incroyable. Pathétique. {player} tu vas faire {action} et tu vas pas en mourir. Peut-être.",
  "Chers amis, le bouffon officiel de la soirée est {player}. Son châtiment : {action}. Applaudissez !",
  "T'inquiète {player} ça va aller... non ça va pas aller. Tu dois {action}. Bonne chance sale gosse !",
];

// ─── Speech ──────────────────────────────────────────────
const synth = window.speechSynthesis;
let frenchVoice = null;

function loadVoices() {
  const voices = synth.getVoices();
  frenchVoice = voices.find(v => v.lang.startsWith('fr')) || voices[0] || null;
}

synth.onvoiceschanged = loadVoices;
loadVoices();

function speak(text) {
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  if (frenchVoice) u.voice = frenchVoice;
  u.lang = 'fr-FR';
  u.rate = 0.88;
  u.pitch = 1.15;
  u.volume = 1;
  synth.speak(u);
}

// ─── Navigation ──────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ─── Gage Screen ─────────────────────────────────────────
const gageInput = document.getElementById('gage-input');
const charCountEl = document.getElementById('char-count');

gageInput.addEventListener('input', () => {
  charCountEl.textContent = gageInput.value.length;
});

function validateGage() {
  gage = gageInput.value.trim();
  if (!gage) {
    gageInput.focus();
    gageInput.style.borderColor = 'var(--accent)';
    gageInput.style.animation = 'none';
    setTimeout(() => { gageInput.style.borderColor = ''; }, 1200);
    return;
  }
  showScreen('screen-players');
}

// ─── Players Screen ──────────────────────────────────────
function openCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    pendingPhoto = null;
    return;
  }
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
    .then(stream => {
      cameraStream = stream;
      document.getElementById('camera-video').srcObject = stream;
      document.getElementById('camera-modal').classList.remove('hidden');
    })
    .catch(() => { pendingPhoto = null; });
}

function openGallery() {
  document.getElementById('gallery-input').click();
}

document.getElementById('gallery-input').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.getElementById('capture-canvas');
      const SIZE = 200;
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext('2d');
      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;
      ctx.drawImage(img, sx, sy, size, size, 0, 0, SIZE, SIZE);
      pendingPhoto = canvas.toDataURL('image/jpeg', 0.72);

      const preview = document.getElementById('preview-avatar');
      const placeholder = document.getElementById('avatar-placeholder');
      preview.src = pendingPhoto;
      preview.style.display = 'block';
      placeholder.style.display = 'none';
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
  e.target.value = '';
});

function capturePhoto() {
  const video = document.getElementById('camera-video');
  const canvas = document.getElementById('capture-canvas');
  const SIZE = 200;
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');

  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const size = Math.min(vw, vh);
  const sx = (vw - size) / 2;
  const sy = (vh - size) / 2;

  ctx.translate(SIZE, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, sx, sy, size, size, 0, 0, SIZE, SIZE);

  pendingPhoto = canvas.toDataURL('image/jpeg', 0.72);

  const preview = document.getElementById('preview-avatar');
  const placeholder = document.getElementById('avatar-placeholder');
  preview.src = pendingPhoto;
  preview.style.display = 'block';
  placeholder.style.display = 'none';

  closeCamera();
}

function closeCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }
  document.getElementById('camera-modal').classList.add('hidden');
}

function addPlayer() {
  const input = document.getElementById('player-name');
  const name = input.value.trim();
  if (!name) {
    shakeInput(input);
    return;
  }

  players.push({
    name,
    photo: pendingPhoto,
    color: PLAYER_COLORS[players.length % PLAYER_COLORS.length]
  });

  input.value = '';
  pendingPhoto = null;
  const preview = document.getElementById('preview-avatar');
  const placeholder = document.getElementById('avatar-placeholder');
  preview.src = '';
  preview.style.display = 'none';
  placeholder.style.display = 'block';

  renderPlayers();
  input.focus();
}

function shakeInput(el) {
  el.style.animation = 'none';
  void el.offsetHeight;
  el.style.animation = 'inputShake 0.35s ease';
  el.style.borderColor = 'var(--accent)';
  setTimeout(() => {
    el.style.borderColor = '';
    el.style.animation = '';
  }, 500);
}

function cycleColor(i) {
  const currentIdx = PLAYER_COLORS.indexOf(players[i].color);
  players[i].color = PLAYER_COLORS[(currentIdx + 1) % PLAYER_COLORS.length];
  renderPlayers();
}

function removePlayer(i) {
  players.splice(i, 1);
  renderPlayers();
}

function renderPlayers() {
  const list = document.getElementById('players-list');
  const startBtn = document.getElementById('start-btn');
  const hint = document.getElementById('players-hint');
  const badge = document.getElementById('player-count-badge');

  list.innerHTML = players.map((p, i) => `
    <div class="player-card">
      <div class="player-card-avatar" style="border-color:${p.color};color:${p.color}">
        ${p.photo ? `<img src="${p.photo}" alt="">` : p.name.charAt(0).toUpperCase()}
      </div>
      <span class="player-card-name">${escapeHtml(p.name)}</span>
      <button class="btn-remove" onclick="removePlayer(${i})">✕</button>
    </div>
  `).join('');

  list.querySelectorAll('.player-card').forEach((card, i) => {
    addSwipeToDelete(card, i);
    card.querySelector('.player-card-avatar').addEventListener('click', () => cycleColor(i));
  });

  const ready = players.length >= 2;
  startBtn.disabled = !ready;

  if (players.length === 0) hint.textContent = 'Ajoutez au moins 2 joueurs';
  else if (players.length === 1) hint.textContent = 'Encore 1 joueur minimum';
  hint.style.display = ready ? 'none' : 'block';

  if (badge) badge.textContent = players.length > 0 ? `${players.length} / 8` : '';
}

function addSwipeToDelete(cardEl, playerIndex) {
  let startX = 0, startY = 0, tracking = false, moved = false;

  cardEl.addEventListener('touchstart', e => {
    if (e.target.classList.contains('btn-remove')) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    tracking = true;
    moved = false;
    cardEl.style.transition = '';
  }, { passive: true });

  cardEl.addEventListener('touchmove', e => {
    if (!tracking) return;
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;

    if (!moved && Math.abs(dy) > Math.abs(dx)) {
      tracking = false;
      return;
    }

    if (dx < -8) {
      moved = true;
      e.preventDefault();
      const clamped = Math.max(dx, -(cardEl.offsetWidth + 20));
      cardEl.style.transform = `translateX(${clamped}px)`;
      cardEl.style.opacity = String(Math.max(0, 1 + clamped / cardEl.offsetWidth));
    }
  }, { passive: false });

  cardEl.addEventListener('touchend', () => {
    if (!tracking || !moved) { tracking = false; return; }
    tracking = false;
    const m = cardEl.style.transform.match(/translateX\((-?[\d.]+)px\)/);
    const currentX = m ? parseFloat(m[1]) : 0;

    if (currentX < -80) {
      cardEl.style.transition = 'transform 0.22s ease, opacity 0.22s ease';
      cardEl.style.transform = `translateX(-${cardEl.offsetWidth + 20}px)`;
      cardEl.style.opacity = '0';
      setTimeout(() => removePlayer(playerIndex), 220);
    } else {
      cardEl.style.transition = 'transform 0.22s ease, opacity 0.22s ease';
      cardEl.style.transform = '';
      cardEl.style.opacity = '';
    }
  });
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function startGame() {
  const unlock = new SpeechSynthesisUtterance('');
  synth.speak(unlock);

  resetTouchState();
  showScreen('screen-fingers');
  updateInstruction();
}

// ─── Finger Phase ─────────────────────────────────────────
function resetTouchState() {
  touchPlayerMap = new Map();
  placedOrder = [];
  countdownRunning = false;
  countdownGeneration++;
  winnerIndex = -1;
  document.getElementById('touch-area').innerHTML = '';
  document.getElementById('countdown-overlay').classList.add('hidden');
}

function updateInstruction() {
  const placed = placedOrder.length;
  const total = players.length;
  const instrEl = document.getElementById('fingers-instruction');

  instrEl.style.display = 'flex';
  document.getElementById('next-player-name').textContent =
    placed < total ? players[placed].name : '';

  const progressEl = document.getElementById('fingers-progress');
  progressEl.innerHTML = players.map((_, i) =>
    `<div class="progress-dot${i < placed ? ' done' : ''}"></div>`
  ).join('');
}

const touchArea = document.getElementById('touch-area');
touchArea.addEventListener('touchstart', onTouchStart, { passive: false });
touchArea.addEventListener('touchend', onTouchEnd, { passive: false });
touchArea.addEventListener('touchcancel', onTouchEnd, { passive: false });
touchArea.addEventListener('touchmove', onTouchMove, { passive: false });

function onTouchStart(e) {
  e.preventDefault();
  if (countdownRunning) return;

  for (const touch of e.changedTouches) {
    if (touchPlayerMap.has(touch.identifier)) continue;
    if (placedOrder.length >= players.length) continue;

    const playerIdx = placedOrder.length;
    touchPlayerMap.set(touch.identifier, playerIdx);
    placedOrder.push(playerIdx);

    createTouchCircle(touch, playerIdx);
    if (navigator.vibrate) navigator.vibrate(25);

    if (placedOrder.length === players.length) {
      document.getElementById('fingers-instruction').style.display = 'none';
      setTimeout(startCountdown, 400);
    } else {
      updateInstruction();
    }
  }
}

function onTouchMove(e) {
  e.preventDefault();
  // Circles follow the finger even during countdown — feels natural, tricher en levant le doigt reste puni
  for (const touch of e.changedTouches) {
    const circle = document.getElementById(`tc-${touch.identifier}`);
    if (circle) {
      circle.style.left = touch.clientX + 'px';
      circle.style.top = touch.clientY + 'px';
    }
  }
}

function onTouchEnd(e) {
  e.preventDefault();

  for (const touch of e.changedTouches) {
    if (touchPlayerMap.has(touch.identifier)) {
      if (countdownRunning) {
        showNoCheat();
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      }
      resetTouchState();
      updateInstruction();
      return;
    }
  }
}

function createTouchCircle(touch, playerIdx) {
  const p = players[playerIdx];
  const el = document.createElement('div');
  el.className = 'touch-circle';
  el.id = `tc-${touch.identifier}`;
  el.style.left = touch.clientX + 'px';
  el.style.top = touch.clientY + 'px';

  const inner = document.createElement('div');
  inner.className = 'touch-circle-inner';
  inner.style.borderColor = p.color;
  inner.style.background = p.color + '22';

  if (p.photo) {
    const img = document.createElement('img');
    img.src = p.photo;
    inner.appendChild(img);
  } else {
    inner.textContent = p.name.charAt(0).toUpperCase();
    inner.style.color = p.color;
  }

  const ring = document.createElement('div');
  ring.className = 'touch-circle-ring';
  ring.style.borderColor = p.color;

  const label = document.createElement('div');
  label.className = 'touch-circle-label';
  label.textContent = p.name;

  el.appendChild(ring);
  el.appendChild(inner);
  el.appendChild(label);
  touchArea.appendChild(el);
}

// ─── Countdown ────────────────────────────────────────────
function startCountdown() {
  countdownRunning = true;
  countdownGeneration++;
  const myGen = countdownGeneration;

  const overlay = document.getElementById('countdown-overlay');
  overlay.classList.remove('hidden');

  // Lock animation on all placed circles
  document.querySelectorAll('.touch-circle').forEach(c => c.classList.add('locked'));

  const steps = [3, 2, 1];
  let i = 0;

  function tick() {
    if (!countdownRunning || countdownGeneration !== myGen) return;

    if (i < steps.length) {
      if (navigator.vibrate) navigator.vibrate(70);
      setCountdownEl(steps[i].toString(), 'countdown-number');
      i++;
      setTimeout(tick, 950);
    } else {
      if (navigator.vibrate) navigator.vibrate([80, 40, 80, 40, 180]);
      setCountdownEl("C'EST\nTOI !", 'countdown-go');
      setTimeout(revealWinner, 1100);
    }
  }

  tick();
}

function setCountdownEl(text, className) {
  const overlay = document.getElementById('countdown-overlay');
  const old = document.getElementById('countdown-number');
  const el = document.createElement('div');
  el.id = 'countdown-number';
  el.className = className;
  el.style.whiteSpace = 'pre';
  el.textContent = text;
  overlay.replaceChild(el, old);
}

// ─── Reveal ──────────────────────────────────────────────
function revealWinner() {
  if (!countdownRunning) return;

  const playerIndices = Array.from(touchPlayerMap.values());
  winnerIndex = playerIndices[Math.floor(Math.random() * playerIndices.length)];
  const winner = players[winnerIndex];

  for (const [touchId, pIdx] of touchPlayerMap) {
    const circle = document.getElementById(`tc-${touchId}`);
    if (!circle) continue;
    if (pIdx === winnerIndex) {
      circle.classList.add('winner');
      circle.querySelector('.touch-circle-inner').style.borderWidth = '4px';
    } else {
      circle.style.opacity = '0.25';
    }
  }

  const variant = VOICE_VARIANTS[Math.floor(Math.random() * VOICE_VARIANTS.length)];
  currentRevealText = variant
    .replace(/{player}/g, winner.name)
    .replace(/{action}/g, gage);

  const avatarEl = document.getElementById('reveal-avatar');
  avatarEl.style.borderColor = winner.color;
  avatarEl.style.boxShadow = `0 0 50px ${winner.color}60`;
  avatarEl.style.color = winner.color;
  avatarEl.innerHTML = winner.photo
    ? `<img src="${winner.photo}" alt="">`
    : winner.name.charAt(0).toUpperCase();

  document.getElementById('reveal-name').textContent = winner.name;
  document.getElementById('reveal-gage').innerHTML =
    `<strong>Ton gage</strong>${escapeHtml(gage)}`;

  setTimeout(() => {
    showScreen('screen-reveal');
    setTimeout(speakReveal, 300);
  }, 600);
}

function speakReveal() {
  speak(currentRevealText);
}

// ─── Anti-triche flash ───────────────────────────────────
function showNoCheat() {
  const el = document.getElementById('no-cheat-overlay');
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 900);
}

// ─── Post-game ───────────────────────────────────────────
function replayGame() {
  synth.cancel();
  resetTouchState();
  showScreen('screen-fingers');
  updateInstruction();
}

function newGame() {
  synth.cancel();
  players = [];
  gage = '';
  pendingPhoto = null;
  gageInput.value = '';
  charCountEl.textContent = '0';
  renderPlayers();
  showScreen('screen-home');
}

// ─── Input helpers ───────────────────────────────────────
document.getElementById('player-name').addEventListener('keydown', e => {
  if (e.key === 'Enter') addPlayer();
});
