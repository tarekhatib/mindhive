document.addEventListener("DOMContentLoaded", () => {
  const tasksList = document.querySelector(".tasks-list");
  const searchInput = document.getElementById("search-tasks");
  const filterSelect = document.getElementById("task-filter");
  const addBtn = document.getElementById("add-task-btn");

  let currentUserId = null;

  async function fetchCurrentUser() {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        currentUserId = data.user.id;
      } else {
        console.warn("Unable to fetch authenticated user.");
      }
    } catch (err) {
      console.error("Error fetching current user:", err);
    }
  }

  async function fetchTasks(filter = "all") {
    try {
      const res = await fetch(`/api/tasks?filter=${filter}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      const tasks = Array.isArray(data.tasks) ? data.tasks : [];
      renderTasks(tasks);
    } catch (err) {
      console.error("Error loading tasks:", err);
      tasksList.innerHTML = `<p class="no-tasks">Error loading tasks.</p>`;
    }
  }

  function renderTasks(tasks) {
    if (!tasks || tasks.length === 0) {
      tasksList.innerHTML = `<p class="no-tasks">No tasks found.</p>`;
      return;
    }

    tasksList.innerHTML = "";
    tasks.forEach((task) => {
      const item = document.createElement("div");
      item.className = `task-item ${task.completed ? "completed" : ""}`;
      item.innerHTML = `
        <div class="task-left">
          <input type="checkbox" class="task-checkbox" ${
            task.completed ? "checked" : ""
          } data-id="${task.id}">
          <div class="task-info">
            <h3>${task.title}</h3>
            ${
              task.due_date
                ? `<p class="due-date">Due: ${new Date(
                    task.due_date
                  ).toLocaleDateString()}</p>`
                : ""
            }
            ${
              task.description
                ? `<p class="task-desc">${task.description}</p>`
                : ""
            }
          </div>
        </div>
      `;
      tasksList.appendChild(item);
    });
  }

  async function saveNewTask(
    taskElement,
    titleInput,
    dateInput,
    descriptionInput
  ) {
    const title = titleInput.value.trim();
    if (!title) {
      tasksList.removeChild(taskElement);
      return;
    }

    const due_date = dateInput.value || null;
    const description = descriptionInput.value.trim() || null;

    if (!currentUserId) {
      console.error("No user ID found. Please log in again.");
      return;
    }

    taskElement.classList.add("saving");
    const savingMsg = document.createElement("div");
    savingMsg.className = "saving-msg";
    savingMsg.textContent = "Saving...";
    taskElement.appendChild(savingMsg);

    try {
      const res = await fetch("/api/tasks/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUserId,
          title,
          due_date,
          description,
        }),
      });

      if (!res.ok) throw new Error("Failed to add task");
      await fetchTasks();
    } catch (err) {
      console.error("Error adding task:", err);
      savingMsg.textContent = "Failed to save.";
      setTimeout(() => {
        if (taskElement.parentNode) taskElement.removeChild(taskElement);
      }, 2000);
    } finally {
      taskElement.classList.remove("saving");
    }
  }

  addBtn?.addEventListener("click", () => {
    const item = document.createElement("div");
    item.className = "task-item new-task";
    item.innerHTML = `
      <div class="task-left">
        <input type="checkbox" class="task-checkbox" disabled>
        <div class="task-info">
          <input type="text" class="task-title-input" placeholder="New task title" autofocus>
          <input type="date" class="task-date-input" style="margin-top:4px; font-size:0.9em;">
          <textarea class="task-desc-input" placeholder="Description" rows="2" style="margin-top:4px; font-size:0.9em; width: 100%; resize: vertical;"></textarea>
        </div>
      </div>
    `;
    tasksList.insertBefore(item, tasksList.firstChild);

    const titleInput = item.querySelector(".task-title-input");
    const dateInput = item.querySelector(".task-date-input");
    const descriptionInput = item.querySelector(".task-desc-input");

    let saved = false;
    async function trySave() {
      if (saved) return;
      saved = true;
      await saveNewTask(item, titleInput, dateInput, descriptionInput);
    }

    titleInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        titleInput.blur();
      }
    });

    titleInput.addEventListener("blur", trySave);
  });

  tasksList.addEventListener("change", async (e) => {
    if (e.target.classList.contains("task-checkbox")) {
      const id = e.target.dataset.id;
      const completed = e.target.checked;
      try {
        const res = await fetch(`/api/tasks/${id}/complete`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed }),
        });
        if (!res.ok) throw new Error("Failed to update task");
      } catch (err) {
        console.error("Error updating task:", err);
      }
    }
  });

  searchInput?.addEventListener("input", async () => {
    const query = searchInput.value.toLowerCase();
    const res = await fetch("/api/tasks");
    const data = await res.json();
    const tasks = Array.isArray(data.tasks) ? data.tasks : [];
    const filtered = tasks.filter((t) => t.title.toLowerCase().includes(query));
    renderTasks(filtered);
  });

  filterSelect?.addEventListener("change", async () => {
    const filter = filterSelect.value;
    await fetchTasks(filter);
  });

  (async () => {
    await fetchCurrentUser();
    await fetchTasks();
  })();
});
