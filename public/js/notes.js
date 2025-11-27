document.addEventListener("DOMContentLoaded", () => {
  const isEditor = !!document.querySelector(".editor-container");
  const isListView = !!document.querySelector(".notes-container");

  if (isListView) {
    const notesList = document.getElementById("notes-list");
    const searchInput = document.getElementById("search-notes");
    const addBtn = document.getElementById("add-note-btn");

    async function fetchNotes() {
      try {
        const res = await fetch("/api/notes");
        const data = await res.json();
        renderNotes(data.notes || []);
      } catch {
        notesList.innerHTML = `<p class="no-notes">Error loading notes.</p>`;
      }
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
          <div class="note-meta">
            <span>${created.toLocaleDateString()}</span>
          </div>
        `;

        item.addEventListener("click", () => {
          window.location.href = `/notes/edit/${note.id}`;
        });

        notesList.appendChild(item);
      });
    }

    addBtn.addEventListener("click", async () => {
      try {
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Untitled",
            content: "",
            course_id: null,
          }),
        });

        const data = await res.json();
        window.location.href = `/notes/edit/${data.noteId}`;
      } catch {
        alert("Error creating note.");
      }
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

    fetchNotes();
  }

  //notes editor model
  if (isEditor) {
    const noteId = document.getElementById("note-id").value;
    const titleInput = document.getElementById("note-title");
    const bodyInput = document.getElementById("note-body");
    const courseSelect = document.getElementById("note-course");
    const deleteBtn = document.getElementById("delete-note-btn");

    let saveTimer;

    function autoSave() {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(save, 500);
    }

    async function loadCourses(selectedId) {
      try {
        const res = await fetch("/api/courses");
        const data = await res.json();

        courseSelect.innerHTML = `<option value="">No Course</option>`;

        data.courses.forEach((c) => {
          const opt = document.createElement("option");
          opt.value = c.id;
          opt.textContent = c.name;

          if (selectedId && selectedId === c.id) opt.selected = true;

          courseSelect.appendChild(opt);
        });
      } catch {}
    }

    async function save() {
      try {
        await fetch(`/api/notes/${noteId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: titleInput.value.trim(),
            content: bodyInput.value.trim(),
            course_id: courseSelect.value || null,
          }),
        });
      } catch (err) {
        console.error("Autosave failed:", err);
      }
    }

    deleteBtn.addEventListener("click", async () => {
      if (!confirm("Delete this note permanently?")) return;

      try {
        await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
        window.location.href = "/notes";
      } catch {
        alert("Error deleting note.");
      }
    });

    titleInput.addEventListener("input", autoSave);
    bodyInput.addEventListener("input", autoSave);
    courseSelect.addEventListener("change", save);

    loadCourses(courseSelect.dataset.selected);
  }
});