import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function CustomerLogin() {
  // DEMO KULLANICI OLUŞTURMA
if (!localStorage.getItem("customers")) {
  localStorage.setItem(
    "customers",
    JSON.stringify([
      {
        firstName: "Demo",
        lastName: "User",
        identityNo: "11111111111",
        email: "demo@user.com",
        phone: "5550000000",
        password: "12345"
      }
    ])
  );
}

  const navigate = useNavigate();

  // 🔥 TÜM USESTATE'LER BURADA OLMAK ZORUNDA
  const [tab, setTab] = useState("login");

  const [identityNo, setIdentityNo] = useState("");
  const [email, setEmail] = useState("");

  // ✔ ŞİFRE STATE'LERİNİ BURAYA EKLEYECEKSİN
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [regData, setRegData] = useState({
    firstName: "",
    lastName: "",
    identityNo: "",
    email: "",
    phone: "",
  });


  // ----------------- LOGIN -----------------
const handleLogin = () => {
  const customers = JSON.parse(localStorage.getItem("customers")) || [];

  const found = customers.find(
    (c) => c.email === email && c.password === password
  );

  if (found) {
    alert("Login successful!");
    navigate("/customerdashboard");

  } else {
    alert("Invalid email or password!");
  }
};


  // ----------------- REGISTER -----------------
  const handleRegister = () => {
    if (!regData.firstName || !regData.lastName || !regData.email || !regData.identityNo) {
      alert("Please fill all required fields!");
      return;
    }

    let customers = JSON.parse(localStorage.getItem("customers")) || [];
    customers.push(regData);

    localStorage.setItem("customers", JSON.stringify(customers));
    alert("Registration successful!");
    setTab("login");
  };

  // ----------------- GOOGLE LOGIN (FAKE) -----------------
  const handleGoogle = () => {
    alert("Google login coming soon! (UI hazır)");
  };

  return (
    <div className="modern-login-container">

      <div className="modern-login-card">
        <div className="login-icon">
          <div className="hotel-icon">👤</div>
        </div>

        <h2 className="login-title">Customer Login</h2>
        <p className="login-subtitle">Login to view your reservations</p>

        {/* ---- TAB MENU ---- */}
        <div className="tab-menu" style={{ display: "flex", marginBottom: "1.5rem" }}>
          <button
            className={`tab-btn ${tab === "login" ? "active" : ""}`}
            onClick={() => setTab("login")}
          >
            Login
          </button>

          <button
            className={`tab-btn ${tab === "register" ? "active" : ""}`}
            onClick={() => setTab("register")}
          >
            Register
          </button>
        </div>

{/* ---- LOGIN FORM ---- */}
{tab === "login" && (
  <div className="login-form">

    {/* EMAIL INPUT */}
    <div className="input-group">
      <label className="input-label">Email</label>
      <div className="input-wrapper">
        <span className="input-icon">📧</span>

        <input
          type="email"
          placeholder="Enter email address..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="modern-input"
        />
      </div>
    </div>

    {/* PASSWORD INPUT */}
    <div className="input-group">
      <label className="input-label">Password</label>

      <div className="input-wrapper">
        <span className="input-icon">🔑</span>

        <input
          type={passwordVisible ? "text" : "password"}
          placeholder="Enter password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="modern-input"
        />

        {/* GÖZ İKONU */}
        <span
          onClick={() => setPasswordVisible(!passwordVisible)}
          style={{
            position: "absolute",
            right: "1rem",
            cursor: "pointer",
            fontSize: "1.1rem",
            color: "#a0aec0",
          }}
        >
          {passwordVisible ? "🙈" : "👁️"}
        </span>
      </div>
    </div>

    <button className="modern-login-button" onClick={handleLogin}>
      Login
    </button>

  </div>
)}


        {/* ---- REGISTER FORM ---- */}
        {tab === "register" && (
          <div className="login-form">
            <div className="input-group">
              <label className="input-label">First Name</label>
              <input
                className="modern-input"
                placeholder="John"
                onChange={(e) => setRegData({ ...regData, firstName: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Last Name</label>
              <input
                className="modern-input"
                placeholder="Doe"
                onChange={(e) => setRegData({ ...regData, lastName: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Identity Number</label>
              <input
                className="modern-input"
                placeholder="12345678901"
                onChange={(e) => setRegData({ ...regData, identityNo: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Email</label>
              <input
                className="modern-input"
                placeholder="example@mail.com"
                onChange={(e) => setRegData({ ...regData, email: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Phone</label>
              <input
                className="modern-input"
                placeholder="+90 5xx xxx xx xx"
                onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
              />
            </div>

            <button className="modern-login-button" onClick={handleRegister}>
              Register
            </button>
          </div>
        )}

        {/* ---- OR / GOOGLE ---- */}
        <p className="login-subtitle" style={{ marginTop: "1rem" }}>
          — or continue with —
        </p>

<button className="google-btn" onClick={handleGoogle}>
  <img 
    src="https://cdn.iconscout.com/icon/free/png-256/free-google-icon-svg-download-png-189824.png?f=webp&w=128" 
    alt="google" 
  />
  Continue with Google
</button>


      </div>
    </div>
  );
}
