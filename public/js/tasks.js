document.addEventListener("DOMContentLoaded", () => {
  const tasksList = document.querySelector(".tasks-list");
  const searchInput = document.getElementById("search-tasks");
  const filterSelect = document.getElementById("task-filter");
  const addBtn = document.getElementById("add-task-btn");

  let currentUserId = null;
  let activeEditItem = null;
  let completeTimeouts = {};

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
    const res = await fetch(`/api/tasks?filter=${filter}`);
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    tasks.forEach((task) => {
  let due = null;
  let isToday = false;
  let isPast = false;

  if (task.due_date) {
    due = new Date(task.due_date);
    due.setHours(0, 0, 0, 0);

    isToday = due.getTime() === today.getTime();
    isPast = due.getTime() < today.getTime();
  }

  const item = document.createElement("div");
  item.className = "task-item";
  item.dataset.id = task.id;

  item.innerHTML = `
    <div class="task-left">
      <input type="checkbox" class="task-checkbox" data-id="${task.id}">
      <div class="task-info">
        <h3>${task.title}</h3>
        ${
          task.due_date
            ? `<p class="due-date ${isPast ? "overdue" : ""}">
                 ${
                   isToday
                     ? "Due: Today"
                     : "Due: " + due.toLocaleDateString()
                 }
               </p>`
            : ""
        }
        ${task.description ? `<p class="task-desc">${task.description}</p>` : ""}
      </div>
    </div>
  `;

  attachItemEvents(item, task);
  tasksList.appendChild(item);
});
  }

  async function createNewTask() {
    if (activeEditItem) {
  activeEditItem = null;
}
  try {
    const res = await fetch("/api/tasks/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "New Task",
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
        title: "New Task",
        description: "",
        due_date: null
      });
    }
  } catch (err) {
    console.error("❌ Error creating task:", err);
    alert("Failed to create task.");
  }
}

addBtn.addEventListener("click", createNewTask);

  function attachItemEvents(item, task) {
    const checkbox = item.querySelector(".task-checkbox");

    checkbox.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = task.id;

      if (completeTimeouts[id]) {
        clearTimeout(completeTimeouts[id]);
        delete completeTimeouts[id];
        checkbox.checked = false;
        return;
      }

      completeTimeouts[id] = setTimeout(async () => {
        await deleteTask(id);
        await fetchTasks(filterSelect.value);
        delete completeTimeouts[id];
      }, 2000);
    });

    item.addEventListener("click", () => {
      enterEditMode(item, task);
    });
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
          <input class="task-edit-title" type="text" value="${task.title}">
          <input class="task-edit-date" type="date" value="${
            task.due_date ? task.due_date.split("T")[0] : ""
          }">
          <textarea class="task-edit-desc" rows="2">${
            task.description || ""
          }</textarea>
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

        if (
          (e.key === "Backspace" || e.key === "Delete") &&
          el === title &&
          title.value.trim() === ""
        ) {
          deleteTask(id);
        }
      });
    });

    del.addEventListener("click", () => deleteTask(id));

    item.querySelector(".edit-wrapper").addEventListener("click", (e) =>
      e.stopPropagation()
    );

    document.addEventListener(
      "click",
      function outsideClick(e) {
        if (!activeEditItem) {
          document.removeEventListener("click", outsideClick);
          return;
        }
        if (activeEditItem.contains(e.target)) return;

        activeEditItem = null;
        fetchTasks(filterSelect.value);
        document.removeEventListener("click", outsideClick);
      },
      { capture: true }
    );
  }

  async function saveTaskEdits(id, title, date, desc) {
    try {
      await fetch(`/api/tasks/${id}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: desc.trim(),
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