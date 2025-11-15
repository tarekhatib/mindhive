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

  const passwordModal = document.getElementById("password-modal");
  const submitPasswordBtn = document.getElementById("submit-password");
  const cancelModalBtn = document.getElementById("cancel-modal");
  const currentPwInput = document.getElementById("current_password");
  const newPwInput = document.getElementById("new_password");

  document.getElementById("change-password").addEventListener("click", () => {
    passwordModal.classList.remove("hidden");
    currentPwInput.focus();
  });

  cancelModalBtn.addEventListener("click", () => {
    passwordModal.classList.add("hidden");
    currentPwInput.value = "";
    newPwInput.value = "";
  });

  async function submitPasswordChange() {
    const currentPassword = currentPwInput.value.trim();
    const newPassword = newPwInput.value.trim();

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

      if (res.ok) {
        passwordModal.classList.add("hidden");
        currentPwInput.value = "";
        newPwInput.value = "";
      }
    } catch (err) {
      alert("Error updating password.");
    }
  }

  submitPasswordBtn.addEventListener("click", submitPasswordChange);

  passwordModal.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitPasswordChange();
    }
  });
});
