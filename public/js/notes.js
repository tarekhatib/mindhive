document.addEventListener("DOMContentLoaded", () => {
  const notesList = document.querySelector(".notes-section");
  const addNoteBtn = document.querySelector(".add-note-btn");

  function renderNotes(notes) {
    notesList.innerHTML = "";
    if (!notes.length) {
      notesList.innerHTML = "<p class='no-notes'>No notes yet.</p>";
      return;
    }

    notes.forEach((note) => {
      const noteCard = document.createElement("div");
      noteCard.classList.add("note-card");
      noteCard.setAttribute("data-id", note.id);
      noteCard.setAttribute("tabindex", "0");

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

      noteCard.addEventListener("click", () => {
        window.location.href = `/notes/${note.id}`;
      });

      noteCard.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          window.location.href = `/notes/${note.id}`;
        }
      });

      notesList.appendChild(noteCard);
    });
  }

  addNoteBtn.addEventListener("click", () => {
    window.location.href = "/notes/new";
  });

  notesList.addEventListener("click", (e) => {
    const card = e.target.closest(".note-card");
    if (!card) return;
    const id = card.getAttribute("data-id");
    if (id) window.location.href = `/notes/${id}`;
  });

  notesList.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const card = e.target.closest(".note-card");
    if (!card) return;
    const id = card.getAttribute("data-id");
    if (id) window.location.href = `/notes/${id}`;
  });

  loadNotes();
});
