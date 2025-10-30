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

function saveState() {
  const state = {
    timerDuration,
    remainingTime,
    isPaused,
  };
  localStorage.setItem("pomodoroState", JSON.stringify(state));
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
        if (isPaused) {
          startBtn?.classList.add("hidden");
          pauseBtn?.classList.remove("hidden");
          pauseBtn.textContent = "Resume";
          cancelBtn?.classList.remove("hidden");
        } else {
          startBtn?.classList.remove("hidden");
          pauseBtn?.classList.add("hidden");
          pauseBtn.textContent = "Pause";
          cancelBtn?.classList.add("hidden");
        }
      }
    } catch {
      // ignore parse errors
    }
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

function startTimer() {
  if (timerInterval || !startBtn || !pauseBtn || !cancelBtn) return;
  isPaused = false;
  startBtn.classList.add("hidden");
  pauseBtn.classList.remove("hidden");
  cancelBtn.classList.remove("hidden");
  pauseBtn.textContent = "Pause";
  saveState();

  timerInterval = setInterval(async () => {
    if (!isPaused) {
      remainingTime--;
      updateTimerDisplay();
      saveState();
      if (remainingTime <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        alert("Pomodoro session completed! 🎉");
        const userIdElement = document.getElementById("user_id");
        const user_id = userIdElement ? userIdElement.value : null;
        if (user_id) {
          try {
            await fetch("/api/pomodoro/complete", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                user_id,
                points: timerDuration / 60,
              }),
            });
          } catch (err) {
            console.error("Error sending pomodoro completion:", err);
          }
        }
        resetTimer();
      }
    }
  }, 1000);
}

function pauseTimer() {
  if (!pauseBtn) return;
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "Resume" : "Pause";
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

startBtn?.addEventListener("click", startTimer);
pauseBtn?.addEventListener("click", pauseTimer);
cancelBtn?.addEventListener("click", cancelTimer);
increaseBtn?.addEventListener("click", increaseTimer);
decreaseBtn?.addEventListener("click", decreaseTimer);

loadState();
updateTimerDisplay();
