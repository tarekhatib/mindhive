document.addEventListener("DOMContentLoaded", () => {
  const settingsForm = document.getElementById("settings-form");
  const logoutButton = document.getElementById("log-out");
  const redButton = document.getElementById("red-btn");

  settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const currentPassword = document.getElementById("current_password").value;
    const newPassword = document.getElementById("new_password").value;

    fetch("/api/settings/change-password", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
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
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/login";
  });

  redButton.addEventListener("click", () => {
    if (!confirm("Are you sure you want to delete your account?")) return;

    fetch("/api/settings/delete-account", {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => res.json())
      .then(() => {
        window.location.href = "/login";
      })
      .catch(() => {});
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

  submitPasswordBtn.addEventListener("click", async () => {
    const currentPassword = currentPwInput.value.trim();
    const newPassword = newPwInput.value.trim();

    if (!currentPassword || !newPassword) return;

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

      if (res.ok) {
        passwordModal.classList.add("hidden");
        currentPwInput.value = "";
        newPwInput.value = "";
      }
    } catch {}
  });

  passwordModal.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitPasswordBtn.click();
    }
  });

  const editModal = document.getElementById("edit-profile-modal");
  const imgInput = document.getElementById("profileImageInput");
  let photoRemoved = false;

  document.getElementById("edit-profile-btn")?.addEventListener("click", () => {
    photoRemoved = false;
    editModal.classList.remove("hidden");
  });

  document.getElementById("cancel-edit-profile")?.addEventListener("click", () => {
    editModal.classList.add("hidden");
    photoRemoved = false;
  });

  imgInput?.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;
    photoRemoved = false;

    const preview = document.getElementById("edit-avatar-preview");

    if (preview.tagName === "DIV") {
      const img = document.createElement("img");
      img.id = "edit-avatar-preview";
      img.className = "edit-avatar-img";
      preview.replaceWith(img);
      img.src = URL.createObjectURL(file);
    } else {
      preview.src = URL.createObjectURL(file);
    }
  });

  const showError = (el, message) => {
    let error = el.nextElementSibling;
    if (!error || !error.classList.contains("input-error-text")) {
      error = document.createElement("p");
      error.className = "input-error-text";
      el.insertAdjacentElement("afterend", error);
    }
    el.classList.add("input-error");
    error.textContent = message;
  };

  const clearError = (el) => {
    el.classList.remove("input-error");
    const error = el.nextElementSibling;
    if (error && error.classList.contains("input-error-text")) error.remove();
  };

  document.getElementById("remove-profile-image")?.addEventListener("click", (e) => {
    e.preventDefault();
    photoRemoved = true;
    imgInput.value = "";

    const firstName = document.getElementById("edit-firstname").value.trim();
    const lastName = document.getElementById("edit-lastname").value.trim();
    const initials =
      (firstName ? firstName[0].toUpperCase() : "") +
      (lastName ? lastName[0].toUpperCase() : "");

    const preview = document.getElementById("edit-avatar-preview");

    if (preview.tagName === "IMG") {
      const placeholder = document.createElement("div");
      placeholder.id = "edit-avatar-preview";
      placeholder.className = "edit-avatar-placeholder";
      placeholder.textContent = initials;
      preview.replaceWith(placeholder);
    }
  });

  document.getElementById("save-profile-info")?.addEventListener("click", async () => {
    const firstNameEl = document.getElementById("edit-firstname");
    const lastNameEl = document.getElementById("edit-lastname");
    const usernameEl = document.getElementById("edit-username");

    const firstName = firstNameEl.value.trim();
    const lastName = lastNameEl.value.trim();
    const username = usernameEl.value.trim();

    clearError(firstNameEl);
    clearError(lastNameEl);
    clearError(usernameEl);

    let invalid = false;

    if (!firstName) {
      showError(firstNameEl, "First Name field can't be empty");
      invalid = true;
    }
    if (!lastName) {
      showError(lastNameEl, "Last Name field can't be empty");
      invalid = true;
    }
    if (!username) {
      showError(usernameEl, "Username field can't be empty");
      invalid = true;
    }

    if (invalid) return;

    const formData = new FormData();
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("username", username);

    if (!photoRemoved && imgInput.files.length > 0) {
      formData.append("profile_image", imgInput.files[0]);
    }

    try {
      if (photoRemoved) {
        await fetch("/api/profile/image", {
          method: "DELETE",
          credentials: "include",
        });
      }

      await fetch("/api/profile", {
        method: "PATCH",
        credentials: "include",
        body: formData,
      });

      editModal.classList.add("hidden");
      setTimeout(() => location.reload(), 150);
    } catch {}
  });
});