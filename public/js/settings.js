document.addEventListener("DOMContentLoaded", () => {
  const settingsForm = document.getElementById("settings-form");
  const redButton = document.getElementById("red-btn");
  const logoutButton = document.getElementById("log-out");

  settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const currentPassword = document.getElementById("current_password").value;
    const newPassword = document.getElementById("new_password").value;

    fetch("/api/settings/change-password", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message || "Password changed successfully!");
        settingsForm.reset();
      })
      .catch(() => alert("Error occurred. Please try again."));
  });

  logoutButton.addEventListener("click", async () => {
    await fetch("/logout", { method: "POST" });
    localStorage.clear();
    window.location.href = "/login";
  });

  redButton.addEventListener("click", () => {
    if (!confirm("Are you sure you want to delete your account?")) return;

    fetch("/api/settings/delete-account", {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message || "Account deleted successfully!");
        window.location.href = "/login";
      })
      .catch(() => alert("Error occurred. Please try again."));
  });

  document.getElementById("change-password").addEventListener("click", () => {
    document.getElementById("password-modal").classList.remove("hidden");
  });

  document.getElementById("cancel-modal").addEventListener("click", () => {
    document.getElementById("password-modal").classList.add("hidden");
  });

  document
    .getElementById("submit-password")
    .addEventListener("click", async () => {
      const currentPassword = document
        .getElementById("current_password")
        .value.trim();
      const newPassword = document.getElementById("new_password").value.trim();

      if (!currentPassword || !newPassword) {
        alert("Please fill both fields");
        return;
      }

      try {
        const res = await fetch("/api/settings/change-password", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
          }),
        });

        const data = await res.json();
        alert(data.message);

        document.getElementById("password-modal").classList.add("hidden");
      } catch (err) {
        alert("Error updating password.");
      }
    });
});
