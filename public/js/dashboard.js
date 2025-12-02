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
});

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