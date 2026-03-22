import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    if (!email || !name || !password) {
      alert("Tüm alanları doldur!");
      return;
    }

    localStorage.setItem(
      "user",
      JSON.stringify({ email, name, password, role: "user" })
    );

    alert("Kayıt başarılı ✅");
    navigate("/");
  };

  return (
    <div className="auth-container">
      <div className="auth-left"></div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Create an account</h2>

          <input
            className="auth-input"
            placeholder="Email Address"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="auth-input"
            placeholder="Full Name"
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="auth-button" onClick={handleRegister}>
            Create an account
          </button>

          <p className="auth-link" onClick={() => navigate("/")}>
            Already have an account? Login
          </p>
        </div>
      </div>
    </div>
  );
}
