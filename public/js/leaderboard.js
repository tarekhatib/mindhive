document.addEventListener("DOMContentLoaded", () => {
  let currentPage = 1;

  const tableBody = document.getElementById("leaderboard-body");
  const paginationPrev = document.getElementById("lb-prev");
  const paginationNext = document.getElementById("lb-next");
  const pageIndicator = document.getElementById("lb-page");

  async function loadLeaderboard(page = 1) {
    const res = await fetch(`/leaderboard/api?page=${page}`);
    const data = await res.json();

    if (!data.success) return;

    currentPage = data.page;
    pageIndicator.textContent = `Page ${currentPage} / ${data.totalPages}`;

    renderUsers(data.users, currentPage);
    updatePagination(data.totalPages);
  }

  function renderUsers(users, page) {
    tableBody.innerHTML = "";

    const startPos = (page - 1) * 50;

    users.forEach((u, i) => {
      const row = document.createElement("div");
      row.className = "lb-row";
      row.dataset.userId = u.id;
      const rankPosition = startPos + i + 1;

      row.innerHTML = `
      <div class="lb-pos">#${rankPosition}</div>

      <div class="lb-user">
        ${
          u.profile_image
            ? `<img src="${u.profile_image}" class="lb-avatar" />`
            : `<div class="lb-avatar placeholder">
                 ${u.first_name[0].toUpperCase()}${
                u.last_name ? u.last_name[1]?.toUpperCase() : ""
              }
               </div>`
        }
        <div class="lb-user-info">
          <span class="lb-name">${u.first_name} ${u.last_name}</span>
          <span class="lb-username">@${u.username}</span>
        </div>
      </div>

      <div class="lb-rank">${u.rank_emoji} ${u.rank_title}</div>

      <div class="lb-points">${u.total_points} pts</div>
    `;

      tableBody.appendChild(row);
    });

    const params = new URLSearchParams(window.location.search);
    const focusId = params.get("focus");

    if (focusId) {
      const row = document.querySelector(`.lb-row[data-user-id="${focusId}"]`);
      if (row) {
        row.classList.add("hover-flash");
        row.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => row.classList.remove("hover-flash"), 200);
      }
    }
  }

  const params = new URLSearchParams(window.location.search);
  const focusId = params.get("focus");
  if (!focusId) return;

  const row = document.querySelector(`.lb-row[data-user-id="${focusId}"]`);
  if (!row) return;

  row.classList.add("hover-flash");
  row.scrollIntoView({ behavior: "smooth", block: "center" });

  setTimeout(() => row.classList.remove("hover-flash"), 2200);

  function updatePagination(totalPages) {
    paginationPrev.disabled = currentPage === 1;
    paginationNext.disabled = currentPage === totalPages;
  }

  paginationPrev.addEventListener("click", () => {
    if (currentPage > 1) loadLeaderboard(currentPage - 1);
  });

  paginationNext.addEventListener("click", () => {
    loadLeaderboard(currentPage + 1);
  });

  loadLeaderboard(1);
});
