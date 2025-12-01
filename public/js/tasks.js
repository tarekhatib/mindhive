document.addEventListener("DOMContentLoaded", () => {
  const tasksList = document.querySelector(".tasks-list");
  const searchInput = document.getElementById("search-tasks");
  const filterSelect = document.getElementById("task-filter");
  const addBtn = document.getElementById("add-task-btn");

  let currentUserId = null;
  let activeEditItem = null;
  let completeTimeouts = {};
  let outsideClickRef = null;

  function formatDate(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    if (target.getTime() === today.getTime()) {
      return `<span class="due-today">Today</span>`;
    }
    if (target.getTime() < today.getTime()) {
      const dd = String(target.getDate()).padStart(2, "0");
      const mm = String(target.getMonth() + 1).padStart(2, "0");
      const yyyy = target.getFullYear();

      return `<span class="due-past">${dd}/${mm}/${yyyy}</span>`;
    }
    const dd = String(target.getDate()).padStart(2, "0");
    const mm = String(target.getMonth() + 1).padStart(2, "0");
    const yyyy = target.getFullYear();

    return `${dd}/${mm}/${yyyy}`;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const highlightId = urlParams.get("highlight");

  if (highlightId) {
    const taskEl = document.querySelector(`.task-item[data-id="${highlightId}"]`);
    if (taskEl) {
      taskEl.classList.add("highlight");
      taskEl.scrollIntoView({ behavior: "smooth", block: "center" });

      setTimeout(() => taskEl.classList.remove("highlight"), 4000);
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

  async function fetchTasks(filter = "all") {
    try {
      const res = await fetch(`/api/tasks?filter=${filter}&offset=${new Date().getTimezoneOffset()}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      renderTasks(data.tasks || []);
    } catch {
      tasksList.innerHTML = `<p class="no-tasks">Error loading tasks.</p>`;
    }
  }

  function renderTasks(tasks) {
    tasksList.innerHTML = "";

    if (!tasks || tasks.length === 0) {
      tasksList.innerHTML = `<p class="no-tasks">No tasks found.</p>`;
      return;
    }

    tasks.sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      return 0;
    });

    tasks.forEach(task => {
      const item = document.createElement("div");
      item.className = "task-item";
      item.dataset.id = task.id;

      item.innerHTML = `
        <div class="task-left">
          <input type="checkbox" class="task-checkbox" data-id="${task.id}">
          <div class="task-info">
            <h3>${task.title}</h3>
            ${task.due_date ? `<p class="due-date">${formatDate(task.due_date)}</p>` : ""}
            ${task.description ? `<p class="task-desc">${task.description}</p>` : ""}
          </div>
        </div>
      `;

      if (task.completed) {
        item.classList.add("completed");
        item.querySelector(".task-checkbox").checked = true;
      }

      attachItemEvents(item, task);
      tasksList.appendChild(item);
    });

    if (highlightId) {
      const taskEl = document.querySelector(`.task-item[data-id="${highlightId}"]`);
      if (taskEl) {
        taskEl.classList.add("highlight");
        taskEl.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => taskEl.classList.remove("highlight"), 500);
      }
    }
  }

  async function createNewTask() {
    if (activeEditItem) activeEditItem = null;

    try {
      const res = await fetch("/api/tasks/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "",
          description: "",
          due_date: null
        }),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();

      await fetchTasks();

      const newItem = document.querySelector(`.task-item[data-id="${data.taskId}"]`);
      if (newItem) {
        enterEditMode(newItem, {
          id: data.taskId,
          title: "",
          description: "",
          due_date: null
        });
      }
    } catch (err) {
      alert("Failed to create task.");
    }
  }

  addBtn.addEventListener("click", createNewTask);

  function attachItemEvents(item, task) {
    const checkbox = item.querySelector(".task-checkbox");

    checkbox.addEventListener("click", e => e.stopPropagation());
    checkbox.addEventListener("mousedown", e => e.stopPropagation());

    checkbox.addEventListener("change", async (e) => {
      e.stopPropagation();
      const completed = checkbox.checked;

      await fetch(`/api/tasks/${task.id}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed })
      });

      fetchTasks(filterSelect.value);
    });

    item.addEventListener("click", () => enterEditMode(item, task));
  }

  function enterEditMode(item, task) {
    if (activeEditItem) return;
    activeEditItem = item;

    const id = task.id;
    item.classList.add("editing");

    item.innerHTML = `
      <div class="task-left edit-wrapper">
        <input type="checkbox" disabled>
        <div class="task-info edit-mode">
          <input class="task-edit-title" type="text"
            value="${task.title === 'New Task' ? '' : task.title}"
            placeholder="New Task" />
          
          <input class="task-edit-date" type="date"
            value="${task.due_date ? task.due_date.split("T")[0] : ""}" />

          <textarea class="task-edit-desc" rows="2"
            placeholder="Description">${task.description || ""}</textarea>
        </div>

        <button class="task-edit-delete"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;

    const title = item.querySelector(".task-edit-title");
    const date = item.querySelector(".task-edit-date");
    const desc = item.querySelector(".task-edit-desc");
    const del = item.querySelector(".task-edit-delete");

    title.focus();

    function submit() {
      saveTaskEdits(id, title.value, date.value, desc.value);
    }

    [title, date, desc].forEach((el) => {
      el.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          activeEditItem = null;
          fetchTasks(filterSelect.value);
        }

        if (e.key === "Enter") {
          e.preventDefault();
          submit();
        }
      });
    });

    // DELETE FIXED 100%
    del.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation(); // <<< CRITICAL
      document.removeEventListener("click", outsideClickRef, true);
      await deleteTask(id);
    });

    item.querySelector(".edit-wrapper").addEventListener("click", e =>
      e.stopPropagation()
    );

    // --- outsideClick FIXED ---
    outsideClickRef = async function (e) {
      if (!activeEditItem) {
        document.removeEventListener("click", outsideClickRef, true);
        return;
      }

      if (activeEditItem.contains(e.target)) return;

      const newTitle = title.value.trim();
      const newDate = date.value;
      const newDesc = desc.value.trim();

      await saveTaskEdits(id, newTitle, newDate, newDesc);

      activeEditItem = null;

      fetchTasks(filterSelect.value);
      document.removeEventListener("click", outsideClickRef, true);
    };

    document.addEventListener("click", outsideClickRef, { capture: true });
  }

  async function saveTaskEdits(id, title, date, desc) {
    try {
      await fetch(`/api/tasks/${id}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || "New Task",
          description: desc.trim() || "",
          due_date: date || null,
        }),
      });
    } catch {}
    activeEditItem = null;
    fetchTasks(filterSelect.value);
  }

  async function deleteTask(id) {
    try {
      await fetch(`/api/tasks/${id}/delete`, { method: "DELETE" });
    } catch {}
    activeEditItem = null;
    fetchTasks(filterSelect.value);
  }

  filterSelect.addEventListener("change", () =>
    fetchTasks(filterSelect.value)
  );

  searchInput.addEventListener("input", async () => {
    const query = searchInput.value.toLowerCase();

    const res = await fetch(`/api/tasks?filter=${filterSelect.value}`);
    const data = await res.json();

    const filtered = data.tasks.filter((t) =>
      t.title.toLowerCase().includes(query)
    );

    renderTasks(filtered);
  });

  (async () => {
    await fetchCurrentUser();
    await fetchTasks();
  })();
});