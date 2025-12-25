const timerDisplay = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");

const feedback = document.getElementById("feedback");
const durationText = document.getElementById("durationText");
const gentleText = document.getElementById("gentleText");
const visualBar = document.getElementById("visualBar");

const totalTimeText = document.getElementById("totalTime");
const sessionCountText = document.getElementById("sessionCount");

const goalHoursInput = document.getElementById("goalHours");
const goalMinutesInput = document.getElementById("goalMinutes");
const goalSecondsInput = document.getElementById("goalSeconds");

let startTime = null;
let intervalId = null;

/* ---------- UTIL ---------- */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function sanitizeInput(input, max = null) {
  input.addEventListener("input", () => {
    let value = parseInt(input.value, 10);
    if (isNaN(value) || value < 0) value = 0;
    if (max !== null && value > max) value = max;
    input.value = value;
  });
}

sanitizeInput(goalHoursInput);
sanitizeInput(goalMinutesInput, 59);
sanitizeInput(goalSecondsInput, 59);

function getGoalSeconds() {
  const h = parseInt(goalHoursInput.value) || 0;
  const m = parseInt(goalMinutesInput.value) || 0;
  const s = parseInt(goalSecondsInput.value) || 0;
  return h * 3600 + m * 60 + s;
}

/* ---------- TIMER ---------- */
function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  timerDisplay.textContent = formatTime(elapsed);
}

startBtn.addEventListener("click", () => {
  startTime = Date.now();
  intervalId = setInterval(updateTimer, 1000);

  feedback.style.display = "none";
  visualBar.style.width = "0%";

  startBtn.disabled = true;
  stopBtn.disabled = false;
});

stopBtn.addEventListener("click", () => {
  clearInterval(intervalId);

  const duration = Math.floor((Date.now() - startTime) / 1000);
  const session = { start: startTime, duration };

  saveSession(session);
  showFeedback(duration);
  updateSummary();

  startBtn.disabled = false;
  stopBtn.disabled = true;
});

/* ---------- STORAGE ---------- */
function saveSession(session) {
  const sessions = getSessions();
  sessions.push(session);
  localStorage.setItem("sessions", JSON.stringify(sessions));
}

function getSessions() {
  const data = localStorage.getItem("sessions");
  return data ? JSON.parse(data) : [];
}

/* ---------- FEEDBACK ---------- */
function showFeedback(duration) {
  feedback.style.display = "block";
  durationText.textContent = `You focused for ${formatTime(duration)}.`;

  if (duration < 60) {
    gentleText.textContent = "Nice start. Even short focus counts.";
  } else if (duration < 300) {
    gentleText.textContent = "Nice focus session. Consider a short break.";
  } else {
    gentleText.textContent = "Great focus. Remember to rest your eyes.";
  }

  const goalSeconds = getGoalSeconds();
  if (goalSeconds > 0) {
    const percent = Math.min((duration / goalSeconds) * 100, 100);
    visualBar.style.width = percent + "%";
  }
}

/* ---------- SUMMARY ---------- */
function updateSummary() {
  const sessions = getSessions();
  const today = new Date().toDateString();

  const todaySessions = sessions.filter(
    s => new Date(s.start).toDateString() === today
  );

  const totalSeconds = todaySessions.reduce(
    (sum, s) => sum + s.duration, 0
  );

  totalTimeText.textContent =
    `Today: ${formatTime(totalSeconds)} focused`;

  sessionCountText.textContent =
    `Sessions today: ${todaySessions.length}`;
}

updateSummary();