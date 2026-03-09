document.addEventListener("DOMContentLoaded", () => {
  const usernameInput = document.getElementById("regUsername");
  const emailInput = document.getElementById("regEmail");
  const passwordInput = document.getElementById("regPassword");
  const confirmPasswordInput = document.getElementById("regConfirmPassword");
  const registerBtn = document.getElementById("registerBtn");
  const message = document.getElementById("regMessage");

  function setMsg(text, ok) {
    message.textContent = text;
    message.className = "msg " + (ok ? "success" : "error");
  }

  registerBtn.addEventListener("click", () => {
    const username = (usernameInput.value || "").trim();
    const email = (emailInput.value || "").trim();
    const password = passwordInput.value || "";
    const confirmPassword = confirmPasswordInput.value || "";

    if (!username || !email || !password || !confirmPassword) {
      setMsg("Please fill all fields.", false);
      return;
    }

    if (password !== confirmPassword) {
      setMsg("Passwords do not match.", false);
      return;
    }

    if (password.length < 4) {
      setMsg("Password must be at least 4 characters.", false);
      return;
    }

    // Register via localStorage (Mock Backend)
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // Check if user already exists
    const exists = users.some(u => u.username === username || u.email === email);
    if (exists) {
      setMsg("Username or email already exists.", false);
      return;
    }

    // Add new user
    users.push({ username, email, password });
    localStorage.setItem("users", JSON.stringify(users));

    setMsg("Registration successful! Redirecting...", true);
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  });

  // Allow Enter key to register
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") registerBtn.click();
  });
});
