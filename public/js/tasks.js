document.addEventListener("DOMContentLoaded", () => {
  const tasksList = document.querySelector(".tasks-list");
  const searchInput = document.getElementById("search-tasks");
  const filterSelect = document.getElementById("task-filter");
  const addBtn = document.getElementById("add-task-btn");

  let currentUserId = null;
  let activeEditItem = null;

  async function fetchCurrentUser() {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        currentUserId = data.user.id;
      }
    } catch (err) {}
  }

  async function fetchTasks(filter = "all") {
    try {
      let fetchFilter = filter;
      if (!["all", "today", "upcoming"].includes(fetchFilter)) {
        fetchFilter = "all";
      }
      const res = await fetch(`/api/tasks?filter=all`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      let tasks = Array.isArray(data.tasks) ? data.tasks : [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (fetchFilter === "today") {
        tasks = tasks.filter((task) => {
          if (!task.due_date) return false;
          const due = new Date(task.due_date);
          due.setHours(0, 0, 0, 0);
          if (due.getTime() === today.getTime()) return true;
          if (due < today && !task.completed) return true;
          return false;
        });
      } else if (fetchFilter === "upcoming") {
        tasks = tasks.filter((task) => {
          if (!task.due_date) return false;
          const due = new Date(task.due_date);
          due.setHours(0, 0, 0, 0);
          return due > today;
        });
      }
      renderTasks(tasks);
    } catch (err) {
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
      let isToday = false;
      if (task.due_date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(task.due_date);
        due.setHours(0, 0, 0, 0);
        if (due < today && !task.completed) isOverdue = true;
        if (due.getTime() === today.getTime()) isToday = true;
      }

      const item = document.createElement("div");
      item.className = `task-item ${task.completed ? "completed" : ""}`;
      item.dataset.id = task.id;

      item.innerHTML = `
        <div class="task-left">
          <input type="checkbox" class="task-checkbox" data-id="${task.id}" ${
        task.completed ? "checked" : ""
      }>
          <div class="task-info">
            <h3>${task.title}</h3>
            ${
              task.due_date
                ? `<p class="due-date ${isOverdue ? "overdue" : ""}">
                     Due: ${
                       isToday
                         ? "Today"
                         : new Date(task.due_date).toLocaleDateString()
                     }
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

      const checkbox = item.querySelector(".task-checkbox");
      checkbox.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (checkbox.dataset.state === "waiting") {
          checkbox.dataset.state = "";
          clearTimeout(checkbox._timer);
          checkbox.checked = false;
          return;
        }
        checkbox.dataset.state = "waiting";
        checkbox._timer = setTimeout(async () => {
          if (checkbox.dataset.state !== "waiting") return;
          await deleteTask(task.id, item);
          checkbox.dataset.state = "";
          await fetchTasks();
        }, 2000);
      });

      item.addEventListener("click", (e) => {
        if (e.target.classList.contains("task-checkbox")) return;
        if (e.target.closest(".task-edit-delete")) return;
        enterEditMode(item, task);
      });

      tasksList.appendChild(item);
    });
  }

  function enterEditMode(item, task) {
    if (activeEditItem && activeEditItem !== item) return;

    setTimeout(() => {
      activeEditItem = item;
    }, 0);

    const id = task.id;
    item.classList.add("editing");

    item.innerHTML = `
      <div class="task-left edit-wrapper">
        <input type="checkbox" class="task-checkbox" ${
          task.completed ? "checked" : ""
        } data-id="${id}">
        <div class="task-info edit-mode">
          <input type="text" class="task-edit-title" value="${task.title}">
          <input type="date" class="task-edit-date" value="${
            task.due_date ? task.due_date.split("T")[0] : ""
          }">
          <textarea class="task-edit-desc" rows="2">${
            task.description || ""
          }</textarea>
        </div>
        <button class="task-edit-delete"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;

    const titleInput = item.querySelector(".task-edit-title");
    const dateInput = item.querySelector(".task-edit-date");
    const descInput = item.querySelector(".task-edit-desc");
    const deleteBtn = item.querySelector(".task-edit-delete");
    const editContainer = item.querySelector(".edit-wrapper");

    editContainer.addEventListener("click", (e) => e.stopPropagation());

    function submitEdits() {
      saveTaskEdits(id, titleInput.value, dateInput.value, descInput.value);
    }

    [titleInput, dateInput, descInput].forEach((el) => {
      el.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          activeEditItem = null;
          fetchTasks();
        }
        if (e.key === "Enter") {
          e.preventDefault();
          submitEdits();
        }
      });
    });

    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteTask(id, item);
    });
  }

  async function saveTaskEdits(id, title, due_date, description) {
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

      if (!res.ok) throw new Error();
      activeEditItem = null;
      await fetchTasks();
    } catch (err) {}
  }

  async function deleteTask(id, item) {
    try {
      const res = await fetch(`/api/tasks/${id}/delete`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      item.classList.remove("pending-complete", "undo");
      activeEditItem = null;
      await fetchTasks();
    } catch (err) {}
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

      if (!res.ok) throw new Error();
      await fetchTasks();
    } catch (err) {}
  }

  addBtn?.addEventListener("click", () => {
    const item = document.createElement("div");
    item.className = "task-item new-task";
    item.innerHTML = `
      <div class="task-left edit-wrapper">
        <input type="checkbox" class="task-checkbox" disabled>
        <div class="task-info edit-mode">
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

    [titleInput, dateInput, descriptionInput].forEach((el) => {
      el.addEventListener("keydown", (e) => {
        if (e.key === "Tab") {
          e.stopPropagation();
          return;
        }
      });
    });

    let saved = false;

    async function trySave() {
      if (saved) return;
      saved = true;
      await saveNewTask(item, titleInput, dateInput, descriptionInput);
    }

    function submitNew() {
      trySave();
    }

    [titleInput, dateInput, descriptionInput].forEach((el) => {
      el.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          item.remove();
        }
        if (e.key === "Enter") {
          e.preventDefault();
          submitNew();
        }
      });
    });

    titleInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        titleInput.blur();
      }
    });
  });

  filterSelect?.addEventListener("change", async () => {
    let val = filterSelect.value;
    if (!["all", "today", "upcoming"].includes(val)) {
      val = "all";
    }
    await fetchTasks(val);
  });

  searchInput?.addEventListener("input", async () => {
    const query = searchInput.value.toLowerCase();
    const res = await fetch("/api/tasks");
    const data = await res.json();
    const tasks = Array.isArray(data.tasks) ? data.tasks : [];
    const filtered = tasks.filter((t) => t.title.toLowerCase().includes(query));
    renderTasks(filtered);
  });

  document.addEventListener("click", (e) => {
    if (!activeEditItem) return;

    const wrapper = activeEditItem.querySelector(".edit-wrapper");
    if (wrapper && wrapper.contains(e.target)) return;

    activeEditItem = null;
    fetchTasks();
  });

  (async () => {
    await fetchCurrentUser();
    await fetchTasks();
  })();
});
