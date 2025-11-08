document.addEventListener("DOMContentLoaded", () => {
  const settingsForm = document.getElementById("settings-form");
  const redButton = document.getElementById("red-btn");

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
});
