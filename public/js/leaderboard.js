document.addEventListener("DOMContentLoaded", () => {
  let currentPage = 1;

  const paginationPrev = document.getElementById("paginationPrev");
  const paginationNext = document.getElementById("paginationNext");
  const pageIndicator = document.querySelector(".lb-page-number");
  const tableBody = document.getElementById("leaderboard-body");

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

    const startPos = (page - 1) * 10;

    users.forEach((u, i) => {
      const row = document.createElement("div");
      row.className = "lb-row lb-item";
      row.dataset.userId = u.id;

      const rankPosition = startPos + i + 1;

      row.innerHTML = `
        <div class="lb-col rank-col">
          ${
            u.position === 1
              ? "🥇"
              : u.position === 2
              ? "🥈"
              : u.position === 3
              ? "🥉"
              : rankPosition
          }
        </div>

        <div class="lb-col user-col user-flex">
          ${
            u.profile_image
              ? `<img class="lb-avatar" src="${u.profile_image}" />`
              : `<div class="lb-avatar-initials">
                  ${u.first_name[0].toUpperCase()}${u.last_name[0]?.toUpperCase()}
                 </div>`
          }

          <div class="lb-info">
            <p class="lb-name">${u.first_name} ${u.last_name}</p>
            <p class="lb-username">@${u.username}</p>
          </div>
        </div>

        <div class="lb-col points-col">${u.total_points} pts</div>
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

        setTimeout(() => row.classList.remove("hover-flash"), 600);
      }
    }
  }

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

  const params = new URLSearchParams(window.location.search);
  const startPage = parseInt(params.get("page")) || 1;
  loadLeaderboard(startPage);
});