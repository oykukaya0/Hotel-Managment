import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  // email yerine username kullanalım
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,   // backend'in beklediği field
          password: password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Login failed");
        return;
      }

      // Giriş başarılı → employee bilgisini sakla
      localStorage.setItem("employee", JSON.stringify(data.employee));

      alert("Login successful!");
      navigate("/dashboard"); // Manager paneline yönlendirme
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="modern-login-container">
      <div className="modern-login-card">
        <div className="login-icon">
          <div className="hotel-icon">🏨</div>
        </div>

        <h2 className="login-title">OTELZ</h2>
        <p className="login-subtitle">Manager Login</p>

        <div className="login-form">
          {/* USERNAME */}
          <div className="input-group">
            <label className="input-label">Username</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="modern-input"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="modern-input"
              />
            </div>
          </div>

          <button className="modern-login-button" onClick={handleLogin}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
