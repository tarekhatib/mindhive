document.addEventListener("DOMContentLoaded", async () => {
  const searchInput = document.querySelector(".search-bar input");
  const resultsBox = document.getElementById("search-results");

  function hideSearchResults() {
    resultsBox.classList.add("hidden");
    resultsBox.innerHTML = "";
  }

  searchInput.addEventListener("input", async () => {
    const q = searchInput.value.trim();

    if (q.length === 0) {
      hideSearchResults();
      return;
    }

    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();

    renderSearchResults(data);
  });

  function renderSearchResults(data) {
    const { tasks, notes, users } = data;
    let html = "";

    if (tasks.length > 0) {
      html += `<div class="sr-section-title">Tasks</div>`;
      tasks.forEach((t) => {
        html += `
        <div class="sr-item"
             data-type="task"
             data-id="${t.id}">
          📝 ${t.title}
        </div>
      `;
      });
    }

    if (notes.length > 0) {
      html += `<div class="sr-section-title">Notes</div>`;
      notes.forEach((n) => {
        html += `
        <div class="sr-item"
             data-type="note"
             data-id="${n.id}">
          📄 ${n.title}
        </div>
      `;
      });
    }

    if (users.length > 0) {
      html += `<div class="sr-section-title">Users</div>`;
      users.forEach((u) => {
        html += `
        <div class="sr-item"
             data-type="user"
             data-id="${u.id}">
          👤 ${u.first_name} ${u.last_name} (@${u.username}) — ${u.total_points} pts
        </div>
      `;
      });
    }

    if (html === "") {
      html = `<div class="sr-empty">No results found</div>`;
    }

    window.latestSearchUsers = users;
    resultsBox.innerHTML = html;
    resultsBox.classList.remove("hidden");
  }

  resultsBox.addEventListener("click", (e) => {
    const item = e.target.closest(".sr-item");
    if (!item) return;

    const type = item.dataset.type;
    const id = item.dataset.id;

  if (type === "user") {
    const user = window.latestSearchUsers?.find(u => u.id == id);
    const page = user?.page || 1;
    location.href = `/leaderboard?page=${page}&focus=${id}`;
    return;
  }

  if (type === "task") {
    location.href = `/tasks?highlight=${id}`;
  }

  if (type === "note") {
    location.href = `/notes/edit/${id}`;
  }
});

  document.addEventListener("click", (e) => {
    if (!resultsBox.contains(e.target) && e.target !== searchInput) {
      hideSearchResults();
    }
  });

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
const finishBtn = document.getElementById("finish-btn");

let timerDuration = 25 * 60;
let remainingTime = timerDuration;
let timerInterval = null;
let isPaused = false;

let pomodoroSound = new Audio("/assets/pomodoro-done.mp3");
pomodoroSound.loop = true;
pomodoroSound.volume = 0.7;

["pointerdown", "click", "touchstart", "keydown", "mouseup"].forEach(event => {
  document.addEventListener(event, () => {
    pomodoroSound.play().then(() => {
      pomodoroSound.pause();
      pomodoroSound.currentTime = 0;
      console.log("Audio unlocked ✔️");
    }).catch(() => {});
  }, { once: true });
});

function playCompletedSound() {
  pomodoroSound.volume = 0.7;
  pomodoroSound.loop = true;
  pomodoroSound.play().catch(() => {});
}

function stopPlayingSound() {
  pomodoroSound.pause();
  pomodoroSound.currentTime = 0;
}

const closeBtn = document.getElementById("pomodoro-close");
if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    document.getElementById("pomodoro-popup").classList.remove("show");
    stopPlayingSound();
  });
}

function showPomodoroPopup() {
  const popup = document.getElementById("pomodoro-popup");

  popup.classList.add("show");

  playCompletedSound();
  navigator.vibrate?.([120, 80, 120]);
}

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
          finishBtn?.classList.remove("hidden");
          pauseBtn?.classList.remove("hidden");
          cancelBtn?.classList.remove("hidden");
          pauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        } else {
          startBtn?.classList.remove("hidden");
          finishBtn?.classList.add("hidden");
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
  finishBtn.classList.remove("hidden");
  pauseBtn.classList.remove("hidden");
  cancelBtn.classList.remove("hidden");
  pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
  saveState();

  timerInterval = setInterval(async () => {
    if (!isPaused) {
      remainingTime--;
      updateTimerDisplay();
      saveState();
      if (remainingTime <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        playCompletedSound();
        showPomodoroPopup();
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
                points: Math.floor(timerDuration / 60),
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
          playCompletedSound();
          navigator.vibrate?.([120, 80, 120]);
          showPomodoroPopup();
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
                  points: Math.floor(timerDuration / 60),
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
  pauseBtn.innerHTML = isPaused 
  ? '<i class="fa-solid fa-play"></i>' 
  : '<i class="fa-solid fa-pause"></i>';
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
  finishBtn.classList.add("hidden");
  pauseBtn?.classList.add("hidden");
  cancelBtn?.classList.add("hidden");
  if (pauseBtn) pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
  isPaused = false;
  saveState();
}

async function finishSession() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;

  const workedSeconds = timerDuration - remainingTime;
  const workedMinutes = Math.floor(workedSeconds / 60);

  if (workedMinutes <= 0) {
    alert("You must complete at least 1 minute.");
    return;
  }

  const userIdElement = document.getElementById("user_id");
  const user_id = userIdElement ? userIdElement.value : null;

  try {
    await fetch("/api/pomodoro/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        points: workedMinutes,
      }),
    });
  } catch (err) {
    console.error("Error sending partial pomodoro session:", err);
  }

  alert(`Session finished early! You earned ${workedMinutes} pts.`);
  resetTimer();
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
finishBtn?.addEventListener("click", finishSession);

loadState();
updateTimerDisplay();

async function loadDashboardTasks() {
  try {
    const res = await fetch(`/api/tasks?filter=today&offset=${new Date().getTimezoneOffset()}`)

    const data = await res.json();
    const tasks = Array.isArray(data.tasks) ? data.tasks : [];

    const todoList = document.getElementById("todo-list");
    if (!todoList) return;

    todoList.innerHTML = "";

    if (tasks.length === 0) {
      todoList.innerHTML = "<li class='no-tasks'>No tasks for today.</li>";
      return;
    }

    tasks.forEach((task) => {
      const li = document.createElement("li");
      li.className = "todo-item";

      li.innerHTML = `
        <input type="checkbox" class="todo-checkbox" data-id="${task.id}">
        <label>${task.title} <span class="due-label"></span></label>
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

async function fetchCurrentUser() {
  try {
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      const data = await res.json();
      currentUserId = data.user.id;
    }
  } catch {}
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