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
  loadDashboardTasks();
  loadState();
  updateTimerDisplay();
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
        isPaused = true;

        updateTimerDisplay();

        if (remainingTime < timerDuration) {
          startBtn?.classList.add("hidden");
          pauseBtn?.classList.remove("hidden");
          cancelBtn?.classList.remove("hidden");
          pauseBtn.textContent = "Resume";
        } else {
          startBtn?.classList.remove("hidden");
          pauseBtn?.classList.add("hidden");
          cancelBtn?.classList.add("hidden");
        }
      }
    } catch {}
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
  if (!isPaused && !timerInterval) {
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

async function loadDashboardTasks() {
  try {
    const res = await fetch("/api/tasks?filter=today");
    if (!res.ok) throw new Error("Failed");

    const data = await res.json();
    const tasks = Array.isArray(data.tasks) ? data.tasks : [];

    const todoList = document.getElementById("todo-list");
    if (!todoList) return;

    todoList.innerHTML = "";

    if (tasks.length === 0) {
      todoList.innerHTML = "<li class='no-tasks'>No tasks for today.</li>";
      return;
    }

    // Normalize today date (local timezone)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    tasks.forEach((task) => {
      const li = document.createElement("li");
      li.className = "todo-item";

      let label = "";

      if (task.due_date) {
        const due = new Date(task.due_date);

        // Normalize MySQL datetime returned in UTC
        due.setMinutes(due.getMinutes() + due.getTimezoneOffset());
        due.setHours(0, 0, 0, 0);

        if (due.getTime() === today.getTime()) {
          label = "Today";
        } else if (due < today) {
          label = "Past Due";
        }
      }

      li.innerHTML = `
        <input type="checkbox" class="todo-checkbox" data-id="${task.id}">
        <label>${task.title} 
          ${label ? `<span class="due-label">${label}</span>` : ""}
        </label>
      `;

      todoList.appendChild(li);
    });
  } catch (err) {
    const todoList = document.getElementById("todo-list");
    if (todoList) {
      todoList.innerHTML =
        "<li class='no-tasks'>Error loading today's tasks.</li>";
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
        await fetch(`/api/tasks/${id}/delete`, { method: "DELETE" });
        await loadDashboardTasks();
      } catch {}
      delete completeTimeouts[id];
    }, 2000);
  }
});
