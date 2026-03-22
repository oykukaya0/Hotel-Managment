import { useState } from "react";
import "./CustomerDashboard.css";

export default function CustomerDashboard() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [availableRooms, setAvailableRooms] = useState([]);

const searchRooms = () => {
  if (!checkIn || !checkOut) {
    alert("Please choose both dates!");
    return;
  }

  fetch(`http://localhost:3000/api/sp/available-rooms?checkIn=${checkIn}&checkOut=${checkOut}`)
    .then(res => res.json())
    .then(data => setAvailableRooms(data))
    .catch(err => console.error(err));
};


  return (
    <div className="customer-dashboard">
      <h1>Make a Reservation</h1>

      <div className="date-picker">
        <div>
          <label>Check-in</label>
          <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
        </div>

        <div>
          <label>Check-out</label>
          <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
        </div>

        <button onClick={searchRooms}>Search Rooms</button>
      </div>

      {availableRooms.length > 0 && (
        <div className="rooms-list">
          <h2>Available Rooms</h2>

          {availableRooms.map(room => (
            <div className="room-card" key={room.RoomID}>
              <h3>Room {room.RoomNumber}</h3>
              <p>Status: {room.Status}</p>
              <button>Reserve This Room</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
