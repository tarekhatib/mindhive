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

      if (!first_name || !last_name || !username || !email || !password) {
        showMessage("All fields are required.", true);
        return;
      }
      if (password.length < 8) {
        showMessage("Password must be at least 8 characters long.", true);
        return;
      }
      if (password !== document.getElementById("confirm_password").value) {
        showMessage("Passwords do not match.", true);
        return;
      }

      try {
        const data = await registerUser({
          first_name,
          last_name,
          username,
          email,
          password,
        });
        window.location.href = "/login";
      } catch (error) {
        showMessage(error.message, true);
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

      if (password.length < 8) {
        showMessage("Password must be at least 8 characters long.", true);
        return;
      }

      try {
        const data = await loginUser({ identifier, password });
        window.location.href = "/dashboard";
      } catch (error) {
        showMessage(error.message, true);
      }
    });
  }
});

const registerUser = async (userData) => {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Registration failed");
  return data;
};

const loginUser = async (credentials) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Login failed");
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  return data;
};

const refreshToken = async () => {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Token refresh failed");
  localStorage.setItem("accessToken", data.accessToken);
  return data;
};

const logoutUser = async () => {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Logout failed");

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "/login";
  return data;
};
