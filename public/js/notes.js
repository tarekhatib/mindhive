document.addEventListener("DOMContentLoaded", () => {
  const isEditor = !!document.querySelector(".editor-container");
  const isListView = !!document.querySelector(".notes-container");

  if (isListView) {
    const notesList = document.getElementById("notes-list");
    const searchInput = document.getElementById("search-notes");
    const addBtn = document.getElementById("add-note-btn");
    const filterSelect = document.getElementById("notes-filter");

    async function fetchNotes() {
      const res = await fetch("/api/notes");
      const data = await res.json();
      renderNotes(data.notes || []);
    }

    function renderNotes(notes) {
      if (!notes.length) {
        notesList.innerHTML = `<p class="no-notes">No notes yet. Add one!</p>`;
        return;
      }

      notesList.innerHTML = "";
      notes.forEach((note) => {
        const item = document.createElement("div");
        item.className = "note-item";
        item.dataset.id = note.id;

        const preview =
          note.content && note.content.length > 120
            ? note.content.substring(0, 120) + "..."
            : note.content || "";

        const created = new Date(note.updated_at || note.created_at);

        item.innerHTML = `
          <div class="note-info">
            <h3>${note.title || "(Untitled)"}</h3>
            <p class="note-preview">${preview}</p>
          </div>
          <div class="note-date">${created.toLocaleDateString()}</div>
        `;

        item.addEventListener("click", () => {
          window.location.href = `/notes/edit/${note.id}`;
        });

        notesList.appendChild(item);
      });
    }

    addBtn.addEventListener("click", async () => {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "",
          content: "",
          course_id: null,
        }),
      });

      const data = await res.json();
      window.location.href = `/notes/edit/${data.noteId}`;
    });

    searchInput.addEventListener("input", async () => {
      const query = searchInput.value.toLowerCase();
      const res = await fetch("/api/notes");
      const data = await res.json();

      const filtered = data.notes.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          (n.content || "").toLowerCase().includes(query)
      );

      renderNotes(filtered);
    });

    if (filterSelect) {
      filterSelect.addEventListener("change", async () => {
        const selected = filterSelect.value;
        const query = searchInput.value.toLowerCase();

        const res = await fetch("/api/notes");
        const data = await res.json();

        let filtered = data.notes;
        if (selected !== "all") {
          filtered = filtered.filter((n) => String(n.course_id) === selected);
        }

        if (query) {
          filtered = filtered.filter(
            (n) =>
              n.title.toLowerCase().includes(query) ||
              (n.content || "").toLowerCase().includes(query)
          );
        }

        renderNotes(filtered);
      });
    }

    fetchNotes();
  }

  if (isEditor) {
    const noteId = document.getElementById("note-id").value;
    const titleInput = document.getElementById("note-title");
    const bodyInput = document.getElementById("note-body");
    const charCounter = document.getElementById("char-counter");
    const MAX_CHARS = 25000;
    const deleteBtn = document.getElementById("delete-note-btn");
    const saveBtn = document.getElementById("save-note-btn");
    const backBtn = document.getElementById("back-btn");

    const courseInput = document.getElementById("course-input");
    const suggestionsBox = document.getElementById("course-suggestions");

    updateCharCounter();

    let courses = [];
    let saveTimer;
    let selectedIndex = -1;

    async function loadCourses() {
      const res = await fetch("/api/courses");
      const data = await res.json();
      courses = data.courses || [];
    }

    function renderSuggestions(list, rawText) {
      suggestionsBox.innerHTML = "";
      selectedIndex = -1;

      const trimmed = rawText.trim();

      if (!trimmed && !courseInput.matches(":focus")) {
        suggestionsBox.classList.remove("active");
        return;
      }

      list.forEach((course, index) => {
        const item = document.createElement("div");
        item.className = "suggestion-item";
        item.dataset.index = index;

        item.innerHTML = `
        <span class="course-name">${course.name}</span>
        <button class="delete-course-btn">&times;</button>
      `;

        item.querySelector(".course-name").addEventListener("click", () => {
          courseInput.value = course.name;
          suggestionsBox.classList.remove("active");
          selectedIndex = -1;
        });

        item
          .querySelector(".delete-course-btn")
          .addEventListener("click", async (e) => {
            e.stopPropagation();

            if (!confirm(`Delete course "${course.name}"?`)) return;

            await fetch(`/api/courses/${course.id}`, {
              method: "DELETE",
            });

            await loadCourses();
            renderSuggestions(courses, courseInput.value.trim());
          });

        suggestionsBox.appendChild(item);
      });

      const exists = courses.some(
        (c) => c.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (trimmed && !exists) {
        const addNew = document.createElement("div");
        addNew.className = "suggestion-item add-new";
        addNew.dataset.index = list.length;
        addNew.textContent = `+ Add New Course: "${trimmed}"`;

        addNew.addEventListener("click", async () => {
          const res = await fetch("/api/courses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: trimmed }),
          });

          const data = await res.json();
          await loadCourses();

          courseInput.value = trimmed;
          suggestionsBox.classList.remove("active");

          await save();
        });

        suggestionsBox.appendChild(addNew);
      }

      suggestionsBox.classList.add("active");
    }

    function highlightSuggestion() {
      const items = Array.from(suggestionsBox.children);
      items.forEach((it, i) => {
        it.classList.toggle("highlighted", i === selectedIndex);
      });
    }

    function selectHighlighted() {
      const items = suggestionsBox.children;
      if (selectedIndex < 0 || selectedIndex >= items.length) return;

      const item = items[selectedIndex];

      if (item.classList.contains("add-new")) {
        item.click();
      } else {
        const courseName = item.querySelector(".course-name")?.textContent;
        if (courseName) {
          courseInput.value = courseName;
          suggestionsBox.classList.remove("active");
        }
      }
    }

    function updateCharCounter() {
      const count = bodyInput.value.length;

      charCounter.textContent = `${count.toLocaleString()} / ${MAX_CHARS.toLocaleString()}`;

      if (count > MAX_CHARS) {
        charCounter.classList.add("over-limit");
      } else {
        charCounter.classList.remove("over-limit");
      }
    }

    courseInput.addEventListener("focus", () => {
      renderSuggestions(courses, courseInput.value.trim());
    });

    courseInput.addEventListener("input", () => {
      const txt = courseInput.value.trim().toLowerCase();
      const matches = courses.filter((c) => c.name.toLowerCase().includes(txt));
      renderSuggestions(matches, courseInput.value);
    });

    courseInput.addEventListener("keydown", (e) => {
      const items = suggestionsBox.children;
      if (!items.length) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % items.length;
        highlightSuggestion();
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        highlightSuggestion();
      }

      if (e.key === "Enter") {
        e.preventDefault();
        selectHighlighted();
      }

      if (e.key === "Escape") {
        suggestionsBox.classList.remove("active");
        selectedIndex = -1;
      }
    });

    async function resolveCourseId() {
      const name = courseInput.value.trim();
      if (!name) return null;

      const existing = courses.find((c) => c.name === name);
      return existing ? existing.id : null;
    }

    function autoSave() {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(save, 500);
    }

    async function save() {
      const course_id = await resolveCourseId();

      await fetch(`/api/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: titleInput.value.trim() || "Untitled",
          content: bodyInput.value.trim() || "",
          course_id,
        }),
      });
    }

    saveBtn.addEventListener("click", async () => {
      await save();

      const toast = document.getElementById("save-toast");
      toast.classList.remove("hidden");
      setTimeout(() => toast.classList.add("shown"), 10);

      setTimeout(() => {
        toast.classList.remove("shown");
        setTimeout(() => {
          window.location.href = "/notes";
        }, 300);
      }, 1000);
});

    deleteBtn.addEventListener("click", async () => {
      if (!confirm("Delete this note?")) return;

      const res = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Failed to move to trash.");
        return;
      }
      window.location.href = "/notes";
      alert("Note moved to Trash");
    });

    backBtn.addEventListener("click", () => {
      window.location.href = "/notes";
    });

    titleInput.addEventListener("input", autoSave);
    bodyInput.addEventListener("input", () => {
      updateCharCounter();

      if (bodyInput.value.length > MAX_CHARS) {
        bodyInput.value = bodyInput.value.substring(0, MAX_CHARS);
      }

      autoSave();
    });

    loadCourses();
  }
});
