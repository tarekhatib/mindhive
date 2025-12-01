document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const messageBox = document.getElementById("message");

  const showMessage = (message, isError = false) => {
    messageBox.textContent = message;
    messageBox.style.color = isError ? "#ff1e5eff" : "#f8e7b9";
    setTimeout(() => (messageBox.textContent = ""), 4000);
  };

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const first_name = document.getElementById("first_name").value.trim();
      const last_name = document.getElementById("last_name").value.trim();
      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const confirm_password =
        document.getElementById("confirm_password").value;

      if (!first_name || !last_name || !username || !email || !password) {
        showMessage("All fields are required.", true);
        return;
      }
      if (password.length < 8) {
        showMessage("Password must be at least 8 characters long.", true);
        return;
      }
      if (password !== confirm_password) {
        showMessage("Passwords do not match.", true);
        return;
      }

      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            first_name,
            last_name,
            username,
            email,
            password,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          showMessage(data.message || "Registration failed.", true);
        } else {
          showMessage("Account created successfully! Redirecting...");
          setTimeout(() => {
            window.location.href = "/login";
          }, 1500);
        }
      } catch (err) {
        showMessage("Network error, please try again.", true);
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const identifier = document.getElementById("identifier").value.trim();
      const password = document.getElementById("password").value;

      if (!identifier || !password) {
        showMessage("Both fields are required.", true);
        return;
      }

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ identifier, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          showMessage(
            data.message || "Invalid username/email or password",
            true
          );
        } else {
          window.location.href = "/dashboard";
        }
      } catch (err) {
        showMessage("Network error, please try again.", true);
      }
    });
  }
});
