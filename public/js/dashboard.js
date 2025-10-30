document.addEventListener("DOMContentLoaded", async () => {
  const greetingElement = document.getElementById("greeting-text");
  const hours = new Date().getHours();
  const greeting =
    hours < 12
      ? "Good morning"
      : hours < 18
      ? "Good afternoon"
      : "Good evening";
  if (greetingElement) {
    const currentText = greetingElement.textContent || "";
    greetingElement.textContent = `${greeting}, ${currentText}`;
  }

  const dateElement = document.getElementById("dashboard-date");
  if (dateElement) {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    dateElement.innerHTML = `<span>${formattedDate}</span>`;
  }

  const weatherElement = document.getElementById("dashboard-weather");
  if (weatherElement) {
    try {
      const res = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=33.8886&longitude=35.4955&current_weather=true"
      );
      const data = await res.json();
      const temp = data?.current_weather?.temperature;
      const weatherCode = data?.current_weather?.weathercode;
      const weatherDescriptions = {
        0: "Clear sky ☀️",
        1: "Mainly clear 🌤️",
        2: "Partly cloudy ⛅",
        3: "Overcast ☁️",
        45: "Fog 🌫️",
        48: "Fog 🌫️",
        51: "Light drizzle 🌦️",
        61: "Rain 🌧️",
        80: "Showers 🌦️",
        95: "Thunderstorm ⛈️",
      };
      const description =
        weatherDescriptions[weatherCode] || "Weather data unavailable";
      weatherElement.innerHTML =
        typeof temp !== "undefined"
          ? `${temp}°C — ${description}`
          : "Weather data unavailable";
    } catch (err) {
      console.error("Weather API error:", err);
      weatherElement.innerHTML = "Unable to load weather 🌧️";
    }
  }

  await fetchCurrentUser();
});

const timeDisplay = document.getElementById("pomodoro-time");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const cancelBtn = document.getElementById("cancel-btn");
const increaseBtn = document.getElementById("increase-btn");
const decreaseBtn = document.getElementById("decrease-btn");

let timerDuration = 25 * 60;
let remainingTime = timerDuration;
let timerInterval = null;
let isPaused = false;
let startedAt = null;

let currentUserId = null;

async function fetchCurrentUser() {
  try {
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      const data = await res.json();
      currentUserId = data.user.id;
      console.log("Authenticated user:", currentUserId);
    } else {
      console.warn("Failed to fetch user");
    }
  } catch (err) {
    console.error("Error fetching user:", err);
  }
}

function getUserId() {
  const el = document.getElementById("user_id");
  if (!el) return null;
  const n = Number(el.value);
  return Number.isFinite(n) ? n : null;
}

function saveState() {
  const state = { timerDuration, remainingTime, isPaused, startedAt };
  localStorage.setItem("pomodoroState", JSON.stringify(state));
}

async function recordCompletion(pointsMinutes) {
  if (!currentUserId) {
    console.warn("No authenticated user found; cannot record session.");
    return;
  }

  try {
    const res = await fetch("/api/pomodoro/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: currentUserId, points: pointsMinutes }),
    });
    if (!res.ok) throw new Error("Failed to record session");
    const data = await res.json();
    console.log("Pomodoro recorded:", data);
  } catch (err) {
    console.error("Error recording pomodoro session:", err);
  }
}

function updateTimerDisplay() {
  if (!timeDisplay) return;
  const minutes = Math.floor(remainingTime / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (remainingTime % 60).toString().padStart(2, "0");
  timeDisplay.textContent = `${minutes}:${seconds}`;
}

function completeTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  remainingTime = 0;
  updateTimerDisplay();
  const points = Math.round(timerDuration / 60);
  recordCompletion(points).finally(() => {
    alert(`Pomodoro session completed! 🎉`);
    resetTimer();
  });
}

function updateElapsedTime() {
  if (!startedAt || isPaused || remainingTime == 0) return;
  const elapsed = Math.floor((Date.now() - startedAt) / 1000);
  if (elapsed > 0) {
    remainingTime = Math.max(remainingTime - elapsed, 0);
    if (remainingTime === 0) {
      completeTimer();
      return;
    }
    startedAt = Date.now();
    updateTimerDisplay();
    saveState();
  }
}

function startTicking() {
  if (timerInterval) return;
  startedAt = Date.now();
  timerInterval = setInterval(() => {
    if (isPaused) return;
    remainingTime -= 1;
    if (remainingTime <= 0) {
      completeTimer();
      return;
    }
    updateTimerDisplay();
    saveState();
  }, 1000);
}

function startTimer() {
  if (!startBtn || !pauseBtn || !cancelBtn) return;
  isPaused = false;
  startBtn.classList.add("hidden");
  pauseBtn.classList.remove("hidden");
  cancelBtn.classList.remove("hidden");
  pauseBtn.textContent = "Pause";
  saveState();
  startTicking();
}

function pauseTimer() {
  if (!pauseBtn) return;
  isPaused = !isPaused;
  if (isPaused) {
    pauseBtn.textContent = "Resume";
  } else {
    pauseBtn.textContent = "Pause";
    startedAt = Date.now();
    startTicking();
  }
  saveState();
}

function cancelTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
  resetTimer();
  saveState();
}

function resetTimer() {
  remainingTime = timerDuration;
  startedAt = null;
  updateTimerDisplay();
  startBtn?.classList.remove("hidden");
  pauseBtn?.classList.add("hidden");
  cancelBtn?.classList.add("hidden");
  if (pauseBtn) pauseBtn.textContent = "Pause";
  isPaused = false;
  saveState();
}

function increaseTimer() {
  timerDuration += 60;
  remainingTime = timerDuration;
  updateTimerDisplay();
  saveState();
}

function decreaseTimer() {
  if (timerDuration > 60) {
    timerDuration -= 60;
    remainingTime = timerDuration;
    updateTimerDisplay();
    saveState();
  }
}

function loadState() {
  const saved = localStorage.getItem("pomodoroState");
  if (saved) {
    try {
      const state = JSON.parse(saved);
      if (
        typeof state.timerDuration === "number" &&
        typeof state.remainingTime === "number" &&
        typeof state.isPaused === "boolean"
      ) {
        timerDuration = state.timerDuration;
        remainingTime = state.remainingTime;
        isPaused = state.isPaused;
        startedAt =
          typeof state.startedAt === "number" ? state.startedAt : null;

        if (isPaused) {
          startBtn?.classList.add("hidden");
          pauseBtn?.classList.remove("hidden");
          pauseBtn.textContent = "Resume";
          cancelBtn?.classList.remove("hidden");
        } else if (remainingTime < timerDuration && remainingTime > 0) {
          startBtn?.classList.add("hidden");
          pauseBtn?.classList.remove("hidden");
          pauseBtn.textContent = "Resume";
          cancelBtn?.classList.remove("hidden");
        } else {
          resetTimer();
        }
      }
    } catch {}
  }
}

startBtn?.addEventListener("click", startTimer);
pauseBtn?.addEventListener("click", pauseTimer);
cancelBtn?.addEventListener("click", cancelTimer);
increaseBtn?.addEventListener("click", increaseTimer);
decreaseBtn?.addEventListener("click", decreaseTimer);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    saveState();
  } else {
    updateElapsedTime();
  }
});

loadState();
updateTimerDisplay();
