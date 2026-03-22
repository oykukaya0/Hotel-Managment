import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";



export default function Dashboard() {
useEffect(() => {
  fetch("http://localhost:3000/api/roomtypes")
    .then(res => res.json())
    .then(data => {
      const formatted = data.map(rt => ({
        id: rt.TypeID,
        name: rt.TypeName,
        description: rt.Description,
        price: rt.BasePrice + "₺ / night",
        size: rt.Capacity + " person",
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",

        // UI default requirements
        amenities: ['Wifi', 'Air Conditioning', 'TV'],
        bedTypes: ['King'],
        
        totalRooms: 0,    // Room tablosu ile bağlayınca değişecek
        occupied: 0,
        available: 0,
        guests: []
      }));

      setRoomTypes(formatted);
    })
    .catch(err => console.error("Error fetching room types", err));
}, []);



  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('type-of-rooms');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomReservations, setRoomReservations] = useState([]);
  useEffect(() => {
  if (selectedRoom) {
    fetch(`http://localhost:3000/api/reservations`)
      .then(res => res.json())
      .then(data => {
        // RoomID eşleşen rezervasyonları filtrele
        const filtered = data.filter(r => r.RoomID === selectedRoom.id);

        // UI için uygun format
        const formatted = filtered.map(r => ({
          name: r.CustomerName,
          room: r.RoomID,
          checkIn: r.CheckInDate?.split("T")[0],
          checkOut: r.CheckOutDate?.split("T")[0]
        }));

        setRoomReservations(formatted);
      })
      .catch(err => console.error("Reservation fetch error:", err));
  }
}, [selectedRoom]);

  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [guestSearch, setGuestSearch] = useState('');
  const [roomTypes, setRoomTypes] = useState([]);
  useEffect(() => {
  fetch("http://localhost:3000/api/roomtypes")
    .then(res => res.json())
    .then(data => {
      const formatted = data.map(rt => ({
        id: rt.TypeID,
        name: rt.TypeName,
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
        description: rt.Description,
        price: rt.BasePrice + "₺ / night",
        size: rt.Capacity + " person",
        amenities: ['Wifi', 'Air Conditioning', 'TV'],
        bedTypes: ['King'],
        totalRooms: 0,
        occupied: 0,
        available: 0,
        guests: []
      }));

      setRoomTypes(formatted);
    })
    .catch(err => console.error("Error fetching room types", err));
}, []);
const [rooms, setRooms] = useState([]);
// Dashboard üst özet kartları için state
const [occupancy, setOccupancy] = useState(null);
const [monthlyRevenue, setMonthlyRevenue] = useState([]);
const [reservationSummary, setReservationSummary] = useState([]);
const [upcomingCheckins, setUpcomingCheckins] = useState([]);


// ROOMS FETCH (MENÜ "rooms" seçilince)
useEffect(() => {
  if (activeMenu === "rooms") {
    fetch("http://localhost:3000/api/rooms")
      .then(res => res.json())
      .then(data => {
        console.log("ROOMS FROM BACKEND:", data);
        setRooms(data);
      })
      .catch(err => console.error("Error fetching rooms:", err));
  }
}, [activeMenu]);
// 🔹 Dashboard raporlarını backend'den çek
useEffect(() => {
  // 1) Doluluk oranı
  fetch("http://localhost:3000/api/reports/occupancy-rate?startDate=2025-01-01&endDate=2025-12-31")
    .then(res => res.json())
    .then(data => {
      setOccupancy(data); // { TotalRooms, OccupiedRooms, OccupancyPercentage }
    })
    .catch(err => console.error("Occupancy error:", err));

  // 2) Aylık gelir
  fetch("http://localhost:3000/api/reports/monthly-revenue")
    .then(res => res.json())
    .then(data => {
      setMonthlyRevenue(data); // array
    })
    .catch(err => console.error("Monthly revenue error:", err));

  // 3) Rezervasyon özeti
  fetch("http://localhost:3000/api/reports/reservation-summary")
    .then(res => res.json())
    .then(data => {
      setReservationSummary(data); // array
    })
    .catch(err => console.error("Reservation summary error:", err));

  // 4) Yaklaşan check-in'ler
  fetch("http://localhost:3000/api/reports/upcoming-checkins")
    .then(res => res.json())
    .then(data => {
      setUpcomingCheckins(data); // array
    })
    .catch(err => console.error("Upcoming checkins error:", err));
}, []);



  const [newRoom, setNewRoom] = useState({
    name: '',
    image: '',
    description: '',
    amenities: '',
    bedTypes: '',
    totalRooms: '',
    price: '',
    size: ''
  });

  const [newGuest, setNewGuest] = useState({
    name: '',
    checkIn: '',
    checkOut: '',
    room: ''
  });

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

const handleAddRoom = async () => {
  if (!newRoom.name || !newRoom.totalRooms) {
    alert('Please fill in at least room name and total rooms!');
    return;
  }

  const payload = {
    TypeName: newRoom.name,
    BasePrice: parseFloat(newRoom.price) || 0,
    Capacity: parseInt(newRoom.size) || 1,
    Description: newRoom.description || ""
  };

  try {
    const res = await fetch("http://localhost:3000/api/roomtypes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Error: " + data.error);
      return;
    }

    alert("Room Type added successfully!");

    // Modalı kapat
    setShowAddRoom(false);

    // Formu sıfırla
    setNewRoom({
      name: '',
      image: '',
      description: '',
      amenities: '',
      bedTypes: '',
      totalRooms: '',
      price: '',
      size: ''
    });

    // Backend'ten güncel listeyi tekrar çek
    fetch("http://localhost:3000/api/roomtypes")
      .then(res => res.json())
      .then((updated) => {
        const formatted = updated.map(rt => ({
          id: rt.TypeID,
          name: rt.TypeName,
          image: rt.Image || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
          description: rt.Description,
          price: rt.BasePrice + "₺ / night",
          size: rt.Capacity + " person",
          amenities: ['Wifi', 'Air Conditioning', 'TV'],
          bedTypes: ['King'],
          guests: [],
          totalRooms: 0,
          occupied: 0,
          available: 0
        }));

        setRoomTypes(formatted);
      });

  } catch (err) {
    console.error(err);
    alert("Network/server error");
  }
};


  const handleAddGuest = () => {
    if (!newGuest.name || !newGuest.checkIn || !newGuest.checkOut || !newGuest.room) {
      alert('Please fill in all guest fields!');
      return;
    }

    const updatedRooms = roomTypes.map(room => {
      if (room.id === selectedRoom.id) {
        return {
          ...room,
          guests: [...room.guests, newGuest],
          occupied: room.occupied + 1,
          available: room.available - 1
        };
      }
      return room;
    });

    setRoomTypes(updatedRooms);
    setSelectedRoom({
      ...selectedRoom,
      guests: [...selectedRoom.guests, newGuest],
      occupied: selectedRoom.occupied + 1,
      available: selectedRoom.available - 1
    });
    
    setShowAddGuest(false);
    setNewGuest({
      name: '',
      checkIn: '',
      checkOut: '',
      room: ''
    });
  };

  const filteredGuests = selectedRoom 
    ? selectedRoom.guests.filter(guest => 
        guest.name.toLowerCase().includes(guestSearch.toLowerCase())
      )
    : [];

  const menuItems = [
    { id: 'front-desk', icon: '🏨', label: 'Front Desk' },
    { id: 'progress', icon: '📊', label: 'Progress' },
    { id: 'request-handling', icon: '📝', label: 'Request Handling' },
    { id: 'maintenance', icon: '🔧', label: 'Maintenance' },
    { id: 'service-usage', icon: '🛎️', label: 'Service Usage' },
    { id: 'contacts', icon: '📞', label: 'Contacts' },
    { id: 'payments', icon: '💳', label: 'Payments' },
    { id: 'restaurant', icon: '🍽️', label: 'Restaurant' },
    { id: 'rooms', icon: '🛏️', label: 'Rooms' },
    { id: 'front-desk', icon: '🏨', label: 'Front Desk' },
    { id: 'customers', icon: '👥', label: 'Customers' }, // YENİ EKLENEN
    { id: 'progress', icon: '📊', label: 'Progress' },
  ];

  const configMenuItems = [
    { id: 'hotel-info', icon: 'ℹ️', label: 'Hotel Info' },
    { id: 'type-of-rooms', icon: '🏠', label: 'Type Of Rooms' },
    { id: 'rate-types', icon: '💰', label: 'Rate Types' },
    { id: 'services', icon: '⚙️', label: 'Services' },
    { id: 'taxes', icon: '📋', label: 'Taxes' },
    { id: 'staffs', icon: '👥', label: 'Staffs' },
    { id: 'tables', icon: '🪑', label: 'Tables' },
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Hotel Management</h2>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => setActiveMenu(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}

          <div className="nav-divider">
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">Configurations</span>
          </div>

          {configMenuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item sub-item ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => setActiveMenu(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <h1 className="page-title">Type Of Rooms</h1>
          
          <div className="top-bar-actions">
            <button className="icon-btn">🔔</button>
            <div className="user-menu">
              <span className="user-name">Öykü</span>
              <button className="user-avatar" onClick={handleLogout}>
                👤
              </button>
            </div>
          </div>
        </header>
          <div className="dashboard-summary">
    <div className="summary-card">
      <h3>Occupancy Rate</h3>
      <p className="summary-main">
        {occupancy ? `${occupancy.OccupancyPercentage}%` : '...'}
      </p>
      <p className="summary-sub">
        {occupancy 
          ? `${occupancy.OccupiedRooms}/${occupancy.TotalRooms} rooms occupied`
          : 'Loading occupancy...'}
      </p>
    </div>

    <div className="summary-card">
      <h3>Total Revenue (Last 12 Months)</h3>
      <p className="summary-main">
        {monthlyRevenue.length > 0
          ? monthlyRevenue.reduce((sum, row) => sum + (row.TotalRevenue || 0), 0).toFixed(2) + ' ₺'
          : '...'}
      </p>
      <p className="summary-sub">
        {monthlyRevenue.length} months of data
      </p>
    </div>

    <div className="summary-card">
      <h3>Total Reservations</h3>
      <p className="summary-main">
        {reservationSummary.length > 0
          ? reservationSummary.reduce((sum, row) => sum + (row.ReservationCount || 0), 0)
          : '...'}
      </p>
      <p className="summary-sub">
        Status: {reservationSummary.map(r => r.Status).join(', ')}
      </p>
    </div>
  </div>
        {/* Content Area */}
        <div className="content-area">
          <div className="content-header">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search rooms..." />
            </div>
            
            <div className="action-buttons">
              <button className="btn-add" onClick={() => setShowAddRoom(true)}>
                <span>+</span>
              </button>
              <button className="btn-menu">☰</button>
            </div>
          </div>

          {/* Room Cards Grid */}
          <div className="room-grid">
            {roomTypes.map((room) => (
              <div 
                key={room.id} 
                className="room-card"
                onClick={() => setSelectedRoom(room)}
              >
                <div className="room-image-container">
                  <img src={room.image} alt={room.name} className="room-image" />
                  <div className="room-status-badge">
                    <span className="status-available">{room.available} Available</span>
                    <span className="status-occupied">{room.occupied} Occupied</span>
                  </div>
                </div>
                
                <div className="room-details">
                  <h3 className="room-name">{room.name}</h3>
                  
                  <div className="room-amenities">
                    {room.amenities.slice(0, 3).map((amenity, index) => (
                      <span key={index} className="amenity-tag">{amenity}</span>
                    ))}
                  </div>
                  
                  <div className="room-beds">
                    {room.bedTypes.map((bed, index) => (
                      <div key={index} className="bed-type">
                        <input type="checkbox" defaultChecked />
                        <span>{bed}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="content-footer">
            <p className="showing-text">Showing {roomTypes.length} of {roomTypes.length}</p>
          </div>
        </div>
      </div>

      {/* Add Room Modal */}
      {showAddRoom && (
        <div className="modal-overlay" onClick={() => setShowAddRoom(false)}>
          <div className="add-room-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAddRoom(false)}>✕</button>
            
            <h2 className="modal-title">Add New Room Type</h2>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Room Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Deluxe Suite"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Total Rooms *</label>
                <input
                  type="number"
                  placeholder="e.g., 10"
                  value={newRoom.totalRooms}
                  onChange={(e) => setNewRoom({...newRoom, totalRooms: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Price per Night</label>
                <input
                  type="text"
                  placeholder="e.g., $250/night"
                  value={newRoom.price}
                  onChange={(e) => setNewRoom({...newRoom, price: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Room Size</label>
                <input
                  type="text"
                  placeholder="e.g., 60 sqm"
                  value={newRoom.size}
                  onChange={(e) => setNewRoom({...newRoom, size: e.target.value})}
                />
              </div>

              <div className="form-group full-width">
                <label>Image URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={newRoom.image}
                  onChange={(e) => setNewRoom({...newRoom, image: e.target.value})}
                />
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  placeholder="Room description..."
                  value={newRoom.description}
                  onChange={(e) => setNewRoom({...newRoom, description: e.target.value})}
                  rows="3"
                />
              </div>

              <div className="form-group full-width">
                <label>Amenities (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g., Wifi, Air conditioned, Mini Bar"
                  value={newRoom.amenities}
                  onChange={(e) => setNewRoom({...newRoom, amenities: e.target.value})}
                />
              </div>

              <div className="form-group full-width">
                <label>Bed Types (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g., King, Queen"
                  value={newRoom.bedTypes}
                  onChange={(e) => setNewRoom({...newRoom, bedTypes: e.target.value})}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowAddRoom(false)}>
                Cancel
              </button>
              <button className="btn-submit" onClick={handleAddRoom}>
                Add Room Type
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Guest Modal */}
      {showAddGuest && (
        <div className="modal-overlay" onClick={() => setShowAddGuest(false)}>
          <div className="add-guest-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAddGuest(false)}>✕</button>
            
            <h2 className="modal-title">Add New Guest</h2>
            
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g., John Doe"
                  value={newGuest.name}
                  onChange={(e) => setNewGuest({...newGuest, name: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Check-in Date *</label>
                <input
                  type="date"
                  value={newGuest.checkIn}
                  onChange={(e) => setNewGuest({...newGuest, checkIn: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Check-out Date *</label>
                <input
                  type="date"
                  value={newGuest.checkOut}
                  onChange={(e) => setNewGuest({...newGuest, checkOut: e.target.value})}
                />
              </div>

              <div className="form-group full-width">
                <label>Room Number *</label>
                <input
                  type="text"
                  placeholder="e.g., 101"
                  value={newGuest.room}
                  onChange={(e) => setNewGuest({...newGuest, room: e.target.value})}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowAddGuest(false)}>
                Cancel
              </button>
              <button className="btn-submit" onClick={handleAddGuest}>
                Add Guest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Detail Modal */}
      {selectedRoom && (
        <div className="modal-overlay" onClick={() => setSelectedRoom(null)}>
          <div className="room-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedRoom(null)}>✕</button>
            
            <div className="modal-content">
              <div className="modal-left">
                <img src={selectedRoom.image} alt={selectedRoom.name} className="modal-image" />
                
                <div className="room-info-grid">
                  <div className="info-card">
                    <div className="info-label">Total Rooms</div>
                    <div className="info-value">{selectedRoom.totalRooms}</div>
                  </div>
                  <div className="info-card">
                    <div className="info-label">Occupied</div>
                    <div className="info-value occupied">{selectedRoom.occupied}</div>
                  </div>
                  <div className="info-card">
                    <div className="info-label">Available</div>
                    <div className="info-value available">{selectedRoom.available}</div>
                  </div>
                  <div className="info-card">
                    <div className="info-label">Price</div>
                    <div className="info-value">{selectedRoom.price}</div>
                  </div>
                </div>
              </div>
              
              <div className="modal-right">
                <h2 className="modal-title">{selectedRoom.name}</h2>
                <p className="modal-description">{selectedRoom.description}</p>
                
                <div className="modal-section">
                  <h3>Room Details</h3>
                  <div className="detail-row">
                    <span className="detail-label">Size:</span>
                    <span className="detail-value">{selectedRoom.size}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Bed Types:</span>
                    <span className="detail-value">{selectedRoom.bedTypes.join(', ')}</span>
                  </div>
                </div>

                <div className="modal-section">
                  <h3>Amenities</h3>
                  <div className="amenities-list">
                    {selectedRoom.amenities.map((amenity, index) => (
                      <span key={index} className="amenity-chip">✓ {amenity}</span>
                    ))}
                  </div>
                </div>

                <div className="modal-section">
                  <div className="section-header">
                    <h3>Current Guests ({selectedRoom.guests.length})</h3>
                    <div className="guest-actions">
                      <div className="guest-search-box">
                        <span className="search-icon">🔍</span>
                        <input
                          type="text"
                          placeholder="Search guests..."
                          value={guestSearch}
                          onChange={(e) => setGuestSearch(e.target.value)}
                        />
                      </div>
                      <button 
                        className="btn-add-small"
                        onClick={() => setShowAddGuest(true)}
                      >
                        + Add Guest
                      </button>
                    </div>
                  </div>
                  
                  <div className="guests-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Guest Name</th>
                          <th>Room</th>
                          <th>Check-in</th>
                          <th>Check-out</th>
                        </tr>
                      </thead>
                      <tbody>
{roomReservations.length > 0 ? (
  roomReservations.map((guest, index) => (
    <tr key={index}>
      <td>{guest.name}</td>
      <td>#{guest.room}</td>
      <td>{guest.checkIn}</td>
      <td>{guest.checkOut}</td>
    </tr>
  ))
) : (
  <tr>
    <td colSpan="4" style={{textAlign: 'center', color: '#94a3b8'}}>
      No reservations found for this room
    </td>
  </tr>
)}

                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}