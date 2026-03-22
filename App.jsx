import { Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerLogin from "./pages/CustomerLogin";
import CustomerDashboard from "./pages/CustomerDashboard";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/customers" element={<Customers />} /> {/* YENİ */}
      <Route path="/customer-login" element={<CustomerLogin />} />
      <Route path="/customer-dashboard" element={<CustomerDashboard />} />
      <Route path="/customerdashboard" element={<CustomerDashboard />} />

    </Routes>
  );
}

export default App;