const timerEl = document.getElementById('timer');
const messageEl = document.getElementById('message');
const progressFill = document.getElementById('progressFill');
const totalLabel = document.getElementById('totalLabel');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const customMinutes = document.getElementById('customMinutes');
const customSeconds = document.getElementById('customSeconds');
const setCustomBtn = document.getElementById('setCustom');
const presetBtns = document.querySelectorAll('.preset-btn');

let totalSeconds = 300; // default 5 min
let remaining = 300;
let intervalId = null;
let isRunning = false;

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function formatProgressLabel(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (sec === 0) return `${m} 分钟`;
  return `${m} 分 ${sec} 秒`;
}

function updateDisplay() {
  timerEl.textContent = formatTime(remaining);

  const pct = totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 0;
  progressFill.style.width = `${pct}%`;

  timerEl.classList.remove('warning', 'danger');
  progressFill.classList.remove('warning', 'danger');
  if (remaining <= 30) {
    timerEl.classList.add('danger');
    progressFill.classList.add('danger');
  } else if (remaining <= 60) {
    timerEl.classList.add('warning');
    progressFill.classList.add('warning');
  }
}

function tick() {
  if (remaining <= 0) {
    stop();
    timerEl.textContent = '00:00';
    timerEl.classList.add('danger');
    return;
  }
  remaining--;
  updateDisplay();
}

function start() {
  if (remaining <= 0) return;
  isRunning = true;
  intervalId = setInterval(tick, 1000);
  startBtn.disabled = true;
  pauseBtn.disabled = false;
}

function stop() {
  isRunning = false;
  clearInterval(intervalId);
  intervalId = null;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
}

function setTime(minutes, seconds) {
  stop();
  totalSeconds = minutes * 60 + seconds;
  remaining = totalSeconds;
  totalLabel.textContent = formatProgressLabel(totalSeconds);
  updateDisplay();
  presetBtns.forEach(b => b.classList.remove('active'));
  const match = document.querySelector(`[data-minutes="${minutes}"]`);
  if (match) match.classList.add('active');
  customMinutes.value = minutes;
  customSeconds.value = seconds;
}

// Preset buttons
presetBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const mins = parseInt(btn.dataset.minutes, 10);
    setTime(mins, 0);
  });
});

// Custom time
setCustomBtn.addEventListener('click', () => {
  const mins = parseInt(customMinutes.value, 10) || 0;
  const secs = parseInt(customSeconds.value, 10) || 0;
  if (mins === 0 && secs === 0) return;
  setTime(mins, secs);
});

// Controls
startBtn.addEventListener('click', start);
pauseBtn.addEventListener('click', stop);
resetBtn.addEventListener('click', () => setTime(Math.floor(totalSeconds / 60), totalSeconds % 60));

// Fullscreen
fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

document.addEventListener('fullscreenchange', () => {
  document.body.classList.toggle('fullscreen', !!document.fullscreenElement);
});

// Show controls on mouse move in fullscreen
let hideTimeout;
document.addEventListener('mousemove', () => {
  if (document.fullscreenElement) {
    document.body.classList.add('show-controls');
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      document.body.classList.remove('show-controls');
    }, 2000);
  }
});

// Keyboard: space to start/pause
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && e.target === document.body) {
    e.preventDefault();
    if (isRunning) stop(); else start();
  }
});

// Save message to localStorage
messageEl.addEventListener('input', () => {
  localStorage.setItem('seat-timer-message', messageEl.textContent);
});
const saved = localStorage.getItem('seat-timer-message');
if (saved) messageEl.textContent = saved;

// Initial display
totalLabel.textContent = formatProgressLabel(totalSeconds);
updateDisplay();
presetBtns[0].classList.add('active');
