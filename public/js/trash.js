document.addEventListener("DOMContentLoaded", () => {
  const trashList = document.getElementById("trash-list");

  async function fetchTrash() {
    try {
      const res = await fetch("/api/trash");
      const data = await res.json();

      renderTrash(data.trash || []);
    } catch (err) {
      trashList.innerHTML = `<p class="no-notes">Failed to load trash.</p>`;
    }
  }
  function renderTrash(items) {
    trashList.innerHTML = "";

    if (!items.length) {
      trashList.innerHTML = `
        <p class="no-notes">Trash is empty!</p>
      `;
      return;
    }

    items.forEach((note) => {
      const div = document.createElement("div");
      div.className = "note-item";
      div.dataset.id = note.id;
      const preview =
        note.content && note.content.length > 80
          ? note.content.substring(0, 80) + "..."
          : note.content || "No content";

      const deletedAt = new Date(note.deleted_at);
      const expiresAt = new Date(note.expires_at);

      const now = new Date();
      const daysLeft = Math.max(
        0,
        Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24))
      );

      div.innerHTML = `
        <div class="trash-info">
          <h3 class="trash-title">${note.title || "(Untitled)"}</h3>
          <p class="trash-preview">${preview}</p>
          <p class="trash-expire">⏳ ${daysLeft} days</p>
        </div>

        <div class="trash-actions">
          <button class="restore-btn">
            <i class="fa-solid fa-rotate-left"></i>
          </button>

          <button class="delete-forever-btn">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `;

      div.querySelector(".restore-btn").addEventListener("click", async () => {
        if (confirm("Restore this note?")) {
          await restoreNote(note.id);
        }
      });

      div
        .querySelector(".delete-forever-btn")
        .addEventListener("click", async () => {
          if (confirm("Permanently delete this note?")) {
            await deleteForever(note.id);
          }
        });

      trashList.appendChild(div);
    });
  }
  async function restoreNote(trashId) {
    try {
      const res = await fetch(`/api/trash/${trashId}/restore`, {
        method: "PATCH",
      });

      if (res.ok) {
        await fetchTrash();
      }
    } catch (err) {
      console.error("Restore error:", err);
    }
  }
  async function deleteForever(trashId) {
    try {
      const res = await fetch(`/api/trash/${trashId}/delete`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchTrash();
      }
    } catch (err) {
      console.error("Permanent delete error:", err);
    }
  }
  fetchTrash();
});
