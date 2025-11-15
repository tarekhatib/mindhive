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
      let isOverdue = false;
      if (task.due_date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(task.due_date);
        due.setHours(0, 0, 0, 0);
        if (due < today && !task.completed) isOverdue = true;
      }

      const item = document.createElement("div");
      item.className = `task-item ${task.completed ? "completed" : ""}`;
      item.dataset.id = task.id;

      item.innerHTML = `
        <div class="task-left">
          <input type="checkbox" class="task-checkbox" ${
            task.completed ? "checked" : ""
          } data-id="${task.id}">
          <div class="task-info">
            <h3>${task.title}</h3>
            ${
              task.due_date
                ? `<p class="due-date ${isOverdue ? "overdue" : ""}">
                     Due: ${new Date(task.due_date).toLocaleDateString()}
                   </p>`
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

      item.addEventListener("click", () => enterEditMode(item, task));
      tasksList.appendChild(item);
    });
  }

  function enterEditMode(item, task) {
    item.addEventListener("click", (ev) => ev.stopPropagation(), {
      once: true,
    });

    const id = task.id;

    item.classList.add("editing");

    item.innerHTML = `
    <div class="task-left">
      <input type="checkbox" class="task-checkbox" ${
        task.completed ? "checked" : ""
      } data-id="${id}">
      <div class="task-info edit-mode">
        <input type="text" class="task-edit-title" value="${
          task.title
        }" autofocus>
        <input type="date" class="task-edit-date" value="${
          task.due_date ? task.due_date.split("T")[0] : ""
        }">
        <textarea class="task-edit-desc" rows="2">${
          task.description || ""
        }</textarea>
        <button class="task-edit-delete">
  <i class="fa-solid fa-trash"></i>
</button>
      </div>
    </div>
  `;

    const titleInput = item.querySelector(".task-edit-title");
    const dateInput = item.querySelector(".task-edit-date");
    const descInput = item.querySelector(".task-edit-desc");
    const deleteBtn = item.querySelector(".task-edit-delete");
    const editContainer = item.querySelector(".task-info");

    editContainer.addEventListener("click", (e) => e.stopPropagation());

    titleInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        saveTaskEdits(
          id,
          titleInput.value,
          dateInput.value,
          descInput.value,
          item
        );
      }
    });

    titleInput.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && titleInput.value.trim() === "") {
        deleteTask(id, item);
      }
    });

    descInput.addEventListener("blur", () => {
      saveTaskEdits(
        id,
        titleInput.value,
        dateInput.value,
        descInput.value,
        item
      );
    });

    dateInput.addEventListener("blur", () => {
      saveTaskEdits(
        id,
        titleInput.value,
        dateInput.value,
        descInput.value,
        item
      );
    });

    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteTask(id, item);
    });
  }

  async function saveTaskEdits(id, title, due_date, description, item) {
    try {
      const res = await fetch(`/api/tasks/${id}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          due_date: due_date || null,
          description: description.trim() || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to update task");
      await fetchTasks();
    } catch (err) {
      console.error("Error saving task:", err);
      item.innerHTML += `<p class="error">Failed to save.</p>`;
    }
  }

  async function deleteTask(id, item) {
    try {
      const res = await fetch(`/api/tasks/${id}/delete`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete task");
      item.remove();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
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

    if (!currentUserId) return;

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
      savingMsg.textContent = "Failed to save.";
      setTimeout(() => {
        if (taskElement.parentNode) taskElement.remove();
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
          <input type="date" class="task-date-input">
          <textarea class="task-desc-input" placeholder="Description" rows="2"></textarea>
        </div>
      </div>
    `;

    tasksList.prepend(item);

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

  filterSelect?.addEventListener("change", async () => {
    await fetchTasks(filterSelect.value);
  });

  searchInput?.addEventListener("input", async () => {
    const query = searchInput.value.toLowerCase();
    const res = await fetch("/api/tasks");
    const data = await res.json();
    const tasks = Array.isArray(data.tasks) ? data.tasks : [];
    const filtered = tasks.filter((t) => t.title.toLowerCase().includes(query));
    renderTasks(filtered);
  });

  (async () => {
    await fetchCurrentUser();
    await fetchTasks();
  })();

  document.addEventListener("click", (e) => {
    const editingItem = document.querySelector(".task-item.editing");
    if (!editingItem) return;

    if (!editingItem.contains(e.target)) {
      fetchTasks();
    }
  });
});
