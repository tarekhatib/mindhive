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
      weatherElement.innerHTML = "Unable to load weather 🌧️";
    }
  }

  await fetchCurrentUser();
  await loadDashboardTasks();
  loadState();
  updateTimerDisplay();
});

const timeDisplay = document.getElementById("pomodoro-time");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const cancelBtn = document.getElementById("cancel-btn");
const increaseBtn = document.getElementById("increase-btn");
const decreaseBtn = document.getElementById("decrease-btn");

const defaultMinutes = 25;
let timerDuration = defaultMinutes * 60;
let remainingTime = timerDuration;
let isPaused = true;
let interval = null;
let endAt = null;

let currentUserId = null;

async function fetchCurrentUser() {
  try {
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      const data = await res.json();
      currentUserId = data.user.id;
    }
  } catch {}
}

async function recordCompletion(pointsMinutes) {
  if (!currentUserId) return;

  try {
    const res = await fetch("/api/pomodoro/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: currentUserId, points: pointsMinutes }),
    });
  } catch {}
}

function updateTimerDisplay() {
  if (!timeDisplay) return;
  const m = String(Math.floor(remainingTime / 60)).padStart(2, "0");
  const s = String(remainingTime % 60).padStart(2, "0");
  timeDisplay.textContent = `${m}:${s}`;
}

function startTicking() {
  if (interval) return;

  interval = setInterval(() => {
    if (isPaused) return;

    remainingTime -= 1;

    if (remainingTime <= 0) {
      clearInterval(interval);
      interval = null;
      remainingTime = 0;
      updateTimerDisplay();
      const points = Math.round(timerDuration / 60);
      recordCompletion(points);
      alert("Pomodoro session completed! 🎉");
      resetTimer();
      return;
    }

    updateTimerDisplay();
    saveState();
  }, 1000);
}

function startTimer() {
  isPaused = false;
  endAt = null;
  startBtn.classList.add("hidden");
  pauseBtn.classList.remove("hidden");
  cancelBtn.classList.remove("hidden");
  pauseBtn.textContent = "Pause";
  saveState();
  startTicking();
}

function pauseTimer() {
  isPaused = true;
  pauseBtn.textContent = "Resume";
  saveState();
}

function cancelTimer() {
  resetTimer();
  saveState();
}

function resetTimer() {
  isPaused = true;
  timerDuration = defaultMinutes * 60;
  remainingTime = timerDuration;
  updateTimerDisplay();
  startBtn.classList.remove("hidden");
  pauseBtn.classList.add("hidden");
  cancelBtn.classList.add("hidden");
  pauseBtn.textContent = "Pause";
  if (interval) clearInterval(interval);
  interval = null;
  endAt = null;
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
  if (!saved) return;

  try {
    const state = JSON.parse(saved);
    timerDuration = state.timerDuration ?? timerDuration;
    remainingTime = state.remainingTime ?? remainingTime;
    isPaused = state.isPaused ?? true;
    updateTimerDisplay();

    if (!isPaused && remainingTime > 0) {
      startBtn.classList.add("hidden");
      pauseBtn.classList.remove("hidden");
      cancelBtn.classList.remove("hidden");
      pauseBtn.textContent = "Resume";
    }
  } catch {}
}

function saveState() {
  localStorage.setItem(
    "pomodoroState",
    JSON.stringify({
      timerDuration,
      remainingTime,
      isPaused,
    })
  );
}

startBtn?.addEventListener("click", startTimer);
pauseBtn?.addEventListener("click", () => {
  if (isPaused) {
    isPaused = false;
    pauseBtn.textContent = "Pause";
    startTicking();
  } else {
    pauseTimer();
  }
});
cancelBtn?.addEventListener("click", cancelTimer);
increaseBtn?.addEventListener("click", increaseTimer);
decreaseBtn?.addEventListener("click", decreaseTimer);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    isPaused = true;
    pauseBtn.textContent = "Resume";
    saveState();
  }
});

async function loadDashboardTasks() {
  try {
    const res = await fetch("/api/tasks?filter=today");
    if (!res.ok) return;

    const data = await res.json();
    const tasks = Array.isArray(data.tasks) ? data.tasks : [];
    const todoList = document.getElementById("todo-list");
    if (!todoList) return;

    todoList.innerHTML = "";

    const filtered = tasks.filter((task) => {
      if (!task.due_date) return false;
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const due = new Date(task.due_date);
      due.setHours(0, 0, 0, 0);
      return due.getTime() <= now.getTime();
    });

    if (filtered.length === 0) {
      todoList.innerHTML = "<p class='no-tasks'>No tasks for today.</p>";
      return;
    }

    filtered.forEach((task) => {
      const li = document.createElement("li");
      li.className = "todo-item";
      li.innerHTML = `
        <input type="checkbox" class="todo-checkbox" data-id="${task.id}">
        <label>${task.title}</label>
      `;
      todoList.appendChild(li);
    });
  } catch {
    const todoList = document.getElementById("todo-list");
    if (todoList) {
      todoList.innerHTML =
        "<p class='no-tasks'>Error loading today's tasks.</p>";
    }
  }
}

let completeTimeouts = {};

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("todo-checkbox")) {
    const id = e.target.dataset.id;

    if (completeTimeouts[id]) {
      clearTimeout(completeTimeouts[id]);
      delete completeTimeouts[id];
      e.target.checked = false;
      return;
    }

    completeTimeouts[id] = setTimeout(async () => {
      try {
        await fetch(`/api/tasks/${id}/delete`, {
          method: "DELETE",
        });
        await loadDashboardTasks();
      } catch {}
      delete completeTimeouts[id];
    }, 2000);
  }
});
