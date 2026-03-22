import { useState } from 'react';
import './Homepage.css';

export default function Homepage() {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const handleSearch = () => {
    alert('Arama yapılıyor...');
  };
  
  const handleAdminLogin = () => {
    if (adminEmail === 'admin@hotel.com' && adminPassword === 'admin123') {
      window.location.href = '/dashboard';
    } else {
      alert('Hatalı giriş!');
    }
  };

  return (
    <div className="homepage">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <h1 className="logo">otelz</h1>
          
          <div className="header-actions">
            <span className="header-text">$</span>
            <span className="flag">🇹🇷</span>
            <button className="header-btn">Help</button>
<a href="/customer-login" className="login-btn" style={{
  borderColor: "#010102FF",
  color: "#0C0F14FF",
}}>
  Customer Login
</a>

            
            
            <a href="/login" className="login-btn">
              Manager Login
            </a>
          </div>
        </div>
      </header>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="modal-overlay" onClick={() => setShowAdminLogin(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setShowAdminLogin(false)}
            >
              ✕
            </button>
            <h2 className="modal-title">Manager Login</h2>
            <input
              type="email"
              placeholder="Email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="modal-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="modal-input"
            />
            <button 
              onClick={handleAdminLogin}
              className="modal-submit"
            >
              Login
            </button>
            <p className="modal-hint">
              Demo: admin@hotel.com / admin123
            </p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="nav-tabs">
        <div className="nav-container">
          <button className="nav-item active">
            <span>🏨</span>
            <span>Hotels</span>
          </button>
          <button className="nav-item">
            <span>🏔️</span>
            <span>Thermal Hotels</span>
          </button>
          <button className="nav-item">
            <span>⛷️</span>
            <span>Ski Hotels</span>
          </button>
          <button className="nav-item">
            <span>🏢</span>
            <span>Apartments & Villas</span>
          </button>
          <button className="nav-item">
            <span>🚤</span>
            <span>Boat Rental</span>
          </button>
          <button className="nav-item">
            <span>⏰</span>
            <span>Hourly Rooms</span>
          </button>
          <button className="nav-item">
            <span>🚗</span>
            <span>Car rental</span>
          </button>
          <button className="nav-item">
            <span>🌙</span>
            <span>Halal Hotels</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h2 className="hero-title">
           Early Booking Opportunities Have Started!
          </h2>
          <div className="hero-subtitle">
            <p className="discount-text">
              Up to 50% Discounts and an Additional 7% Zpara!
            </p>
            <span className="deadline-badge">
              Last Day: December 15
            </span>
          </div>
          
          <button className="cta-button">
            Grab the Opportunities
          </button>

          {/* Search Box */}
          <div className="search-box">
            <div className="search-grid">
              {/* Location */}
              <div className="search-item">
                <label className="search-label">
                  <span>🏨</span>
                  Where are you going?
                </label>
                <input
                  type="text"
                  placeholder="City, hotel name..."
                  className="search-input"
                />
              </div>

              {/* Dates */}
              <div className="search-item dates">
                <div className="date-inputs">
                  <div>
                    <label className="search-label">
                      <span>📅</span>
                      Check-in date
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  <div>
                    <label className="search-label">
                      <span>📅</span>
                      Release date
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="search-input"
                    />
                  </div>
                </div>
              </div>

              {/* Guests */}
              <div className="search-item">
                <label className="search-label">
                  <span>👥</span>
                  Number of Guests
                </label>
                <button
                  onClick={() => setShowGuestPicker(!showGuestPicker)}
                  className="guest-button"
                >
                  {rooms} Room, {guests} Adult
                </button>
                
                {showGuestPicker && (
                  <div className="guest-picker">
                    <div className="guest-row">
                      <span>Room</span>
                      <div className="guest-controls">
                        <button 
                          onClick={() => setRooms(Math.max(1, rooms - 1))}
                          className="control-btn"
                        >
                          -
                        </button>
                        <span>{rooms}</span>
                        <button 
                          onClick={() => setRooms(rooms + 1)}
                          className="control-btn"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="guest-row">
                      <span>Adult</span>
                      <div className="guest-controls">
                        <button 
                          onClick={() => setGuests(Math.max(1, guests - 1))}
                          className="control-btn"
                        >
                          -
                        </button>
                        <span>{guests}</span>
                        <button 
                          onClick={() => setGuests(guests + 1)}
                          className="control-btn"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Search Button */}
              <div className="search-item search-btn-container">
                <button 
                  onClick={handleSearch}
                  className="search-button"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Regions */}
      <section className="popular-section">
        <h3 className="section-title">Popular Hotel Areas</h3>
        <div className="region-grid">
          {[
            { name: 'İstanbul', image: 'https://images.unsplash.com/photo-1629649456013-88519a031d64?q=80&w=1227&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
            { name: 'Antalya', image: 'https://plus.unsplash.com/premium_photo-1661963367880-9b1445d306f8?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
            { name: 'Bodrum', image: 'https://images.unsplash.com/photo-1684858504602-677ac40eadfd?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
            { name: 'Kapadokya', image: 'https://images.unsplash.com/photo-1631152282084-b8f1b380ccab?q=80&w=1073&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
          ].map((region) => (
            <div key={region.name} className="region-card">
              <img 
                src={region.image} 
                alt={region.name}
                className="region-image"
              />
              <div className="region-overlay"></div>
              <h4 className="region-name">{region.name}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2024 Otelz - All rights reserved</p>
      </footer>
    </div>
  );
}