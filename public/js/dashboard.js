document.addEventListener("DOMContentLoaded", async () => {
  // === Dynamic Greeting ===
  const greetingElement = document.getElementById("greeting-text");
  const hours = new Date().getHours();

  let greeting =
    hours < 12
      ? "Good Morning"
      : hours < 18
      ? "Good Afternoon"
      : "Good Evening";

  // Prepend greeting dynamically
  if (greetingElement) {
    const currentText = greetingElement.textContent; // e.g. "Tarek 👋"
    greetingElement.textContent = `${greeting}, ${currentText}`;
  }

  const dateElement = document.getElementById("dashboard-date");
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  dateElement.innerHTML = `<span>${formattedDate}</span>`;

  // === Weather for Beirut ===
  const weatherElement = document.getElementById("dashboard-weather");

  try {
    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=33.8886&longitude=35.4955&current_weather=true"
    );
    const data = await res.json();

    const temp = data.current_weather.temperature;
    const weatherCode = data.current_weather.weathercode;

    // Simple weather text mapping
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

    weatherElement.innerHTML = `${temp}°C — ${description}`;
  } catch (err) {
    console.error("Weather API error:", err);
    weatherElement.innerHTML = "Unable to load weather 🌧️";
  }
});

// === Pomodoro Timer Logic ===
const timeDisplay = document.getElementById("pomodoro-time");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const cancelBtn = document.getElementById("cancel-btn");

let timerDuration = 1 * 60;
let remainingTime = timerDuration;
let timerInterval = null;
let isPaused = false;

function updateTimerDisplay() {
  const minutes = Math.floor(remainingTime / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (remainingTime % 60).toString().padStart(2, "0");
  timeDisplay.textContent = `${minutes}:${seconds}`;
}

function startTimer() {
  if (timerInterval) return;
  isPaused = false;
  startBtn.classList.add("hidden");
  pauseBtn.classList.remove("hidden");
  cancelBtn.classList.remove("hidden");

  timerInterval = setInterval(() => {
    if (!isPaused) {
      remainingTime--;
      updateTimerDisplay();

      if (remainingTime <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        alert("Pomodoro session completed! 🎉");
        resetTimer();
      }
    }
  }, 1000);
}

function pauseTimer() {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "Resume" : "Pause";
}

function cancelTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  resetTimer();
}

function resetTimer() {
  remainingTime = timerDuration;
  updateTimerDisplay();
  startBtn.classList.remove("hidden");
  pauseBtn.classList.add("hidden");
  cancelBtn.classList.add("hidden");
  pauseBtn.textContent = "Pause";
}

startBtn?.addEventListener("click", startTimer);
pauseBtn?.addEventListener("click", pauseTimer);
cancelBtn?.addEventListener("click", cancelTimer);

updateTimerDisplay();
