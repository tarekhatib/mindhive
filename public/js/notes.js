document.addEventListener("DOMContentLoaded", () => {
  const notesList = document.querySelector(".notes-section");
  const addNoteBtn = document.querySelector(".add-note-btn");

  // Fetch and display notes for logged-in user
  async function loadNotes() {
    try {
      const response = await fetch("/api/notes");
      if (!response.ok) throw new Error("Failed to load notes");
      const notes = await response.json();

      renderNotes(notes);
    } catch (err) {
      console.error(err);
      notesList.innerHTML = "<p class='no-notes'>Could not load notes.</p>";
    }
  }

  // Render all notes
  function renderNotes(notes) {
    notesList.innerHTML = "";
    if (!notes.length) {
      notesList.innerHTML = "<p class='no-notes'>No notes yet.</p>";
      return;
    }

    notes.forEach((note) => {
      const noteCard = document.createElement("div");
      noteCard.classList.add("note-card");

      noteCard.innerHTML = `
        <div class="note-info">
          <h3>${note.title}</h3>
          <p class="preview">${note.content.slice(0, 80)}...</p>
        </div>
        <div class="note-meta">
          <span class="date">${new Date(
            note.created_at
          ).toLocaleDateString()}</span>
          <span class="course">${note.course_name || "General"}</span>
        </div>
      `;

      noteCard.addEventListener("dblclick", () => {
        window.location.href = `/notes/${note.id}`;
      });

      notesList.appendChild(noteCard);
    });
  }

  // Add new note logic
  addNoteBtn.addEventListener("click", () => {
    window.location.href = "/notes/new";
  });

  loadNotes();
});
