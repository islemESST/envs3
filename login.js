document.addEventListener("DOMContentLoaded", () => {
  const identifier = document.getElementById("identifier");
  const password = document.getElementById("password");
  const loginBtn = document.getElementById("loginBtn");
  const message = document.getElementById("message");
  const togglePwd = document.getElementById("togglePwd");

  function setMsg(text, ok) {
    message.textContent = text;
    message.className = "msg " + (ok ? "success" : "error");
  }

  // Show / Hide password
  togglePwd.addEventListener("click", () => {
    const hidden = password.type === "password";
    password.type = hidden ? "text" : "password";
    togglePwd.textContent = hidden ? "Hide" : "Show";
  });

  // Login (demo)
  loginBtn.addEventListener("click", () => {
    const id = (identifier.value || "").trim();
    const pwd = password.value || "";

    if (!id || !pwd) {
      setMsg("Please fill all fields.", false);
      return;
    }

    // Login via localStorage (Mock Backend)
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    
    // Default admin user if no users exist
    if (users.length === 0 && id === "admin" && pwd === "1234") {
      localStorage.setItem("user", "admin");
      setMsg("Login successful ✅ (Admin)", true);
      setTimeout(() => { window.location.href = "index.html"; }, 600);
      return;
    }

    const user = users.find(u => (u.username === id || u.email === id) && u.password === pwd);

    if (user) {
      localStorage.setItem("user", user.username);
      setMsg("Login successful ✅", true);
      setTimeout(() => {
        window.location.href = "index.html";
      }, 600);
    } else {
      setMsg("Invalid username/email or password.", false);
    }
  });

  // Allow Enter key to login
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") loginBtn.click();
  });
});
