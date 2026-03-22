const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '12345678',
  database: 'hotel_management'
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
    return;
  }
  console.log('Connected to MySQL database.');
});


app.get('/', (req, res) => {
  res.send('Hotel Management API is running. Use /api/... for endpoints.');
});

app.post('/api/login', (req, res) => {
  console.log("=== LOGIN REQUEST RECEIVED ===");
  console.log("BODY:", req.body);

  const { username, password } = req.body;

  const sql = 'SELECT EmployeeID, FirstName, LastName, Role, PasswordHash, ManagerID FROM Employee WHERE Username = ?';
  
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error("LOGIN SQL ERROR:", err);
      return res.status(500).json({ error: err.message });
    }

    
    const employee = results[0];
    if (employee.PasswordHash === password) { 
      res.json({ 
        message: 'Login successful', 
        employee: {
          id: employee.EmployeeID,
          firstName: employee.FirstName,
          role: employee.Role
        } 
      });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  });
});

app.get('/api/employees', (req, res) => {
  const sql = 'SELECT * FROM Employee';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/employees', (req, res) => {
  const { FirstName, LastName, Role, Phone, Email, Username, PasswordHash, HireDate, Salary, HotelID, ManagerID } = req.body;
  const sql = 'INSERT INTO Employee (FirstName, LastName, Role, Phone, Email, Username, PasswordHash, HireDate, Salary, HotelID, ManagerID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  
  db.query(sql, [FirstName, LastName, Role, Phone, Email, Username, PasswordHash, HireDate, Salary, HotelID, ManagerID], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.status(201).json({ message: 'Employee added successfully', id: result.insertId });
  });
});

app.put('/api/employees/:id', (req, res) => {
  const { FirstName, LastName, Role, Phone, Email, Salary, ManagerID } = req.body;
  const sql = 'UPDATE Employee SET FirstName=?, LastName=?, Role=?, Phone=?, Email=?, Salary=?, ManagerID=? WHERE EmployeeID=?';
  
  db.query(sql, [FirstName, LastName, Role, Phone, Email, Salary, ManagerID, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Employee updated successfully' });
  });
});

app.delete('/api/employees/:id', (req, res) => {
  const sql = 'DELETE FROM Employee WHERE EmployeeID = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Employee deleted successfully' });
  });
});

app.get('/api/hotels', (req, res) => {
  const sql = 'SELECT * FROM Hotel';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

app.get('/api/hotels/:id', (req, res) => {
  const hotelId = req.params.id;
  const sql = 'SELECT * FROM Hotel WHERE HotelID = ?';
  db.query(sql, [hotelId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'Hotel not found' });
    res.json(results[0]);
  });
});

app.get('/api/hotels/:id/rooms', (req, res) => {
  const hotelId = req.params.id;
  const sql = `
    SELECT Room.RoomID, Room.RoomNumber, Room.Floor, Room.Status, RoomType.TypeName
    FROM Room, RoomType
    WHERE Room.RoomTypeID = RoomType.RoomTypeID
      AND Room.HotelID = ?
  `;
  db.query(sql, [hotelId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

app.get('/api/hotels/:id/services', (req, res) => {
  const hotelId = req.params.id;
  const sql = 'SELECT ServiceID, ServiceName, Price, Description FROM Service WHERE HotelID = ?';
  db.query(sql, [hotelId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

app.get('/api/rooms', (req, res) => {
  const sql = 'SELECT * FROM Room';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

app.get('/api/rooms/:id', (req, res) => {
  const roomId = req.params.id;
  const sql = 'SELECT * FROM Room WHERE RoomID = ?';
  db.query(sql, [roomId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'Room not found' });
    res.json(results[0]);
  });
});

app.get('/api/rooms/available', (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).json({ error: 'Please provide start and end query parameters' });
  }
  const sql = `
    SELECT Room.*, RoomType.TypeName, RoomType.BasePrice 
    FROM Room 
    JOIN RoomType ON Room.TypeID = RoomType.TypeID
    WHERE Room.RoomID NOT IN (
      SELECT RoomID FROM Reservation 
      WHERE NOT (CheckOutDate < ? OR CheckInDate > ?)
    )
  `;
  db.query(sql, [start, end], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

app.post('/api/rooms', (req, res) => {
  const { RoomNumber, Floor, Status, HotelID, TypeID } = req.body;
  const sql = 'INSERT INTO Room (RoomNumber, Floor, Status, HotelID, TypeID) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [RoomNumber, Floor, Status, HotelID, TypeID], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Room added', id: result.insertId });
  });
});

app.put('/api/rooms/:id', (req, res) => {
  const { Status } = req.body;
  const sql = 'UPDATE Room SET Status=? WHERE RoomID=?';
  db.query(sql, [Status, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Room status updated successfully' });
  });
});


app.post('/api/roomtypes', (req, res) => {
  const { TypeName, BasePrice, Capacity, Description } = req.body;
  const sql = 'INSERT INTO RoomType (TypeName, BasePrice, Capacity, Description) VALUES (?, ?, ?, ?)';
  db.query(sql, [TypeName, BasePrice, Capacity, Description], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Room Type added', id: result.insertId });
  });
});

app.get('/api/customers', (req, res) => {
  const sql = 'SELECT * FROM Customer';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

app.get('/api/customers/:id', (req, res) => {
  const customerId = req.params.id;
  const sql = 'SELECT * FROM Customer WHERE CustomerID = ?';
  db.query(sql, [customerId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json(results[0]);
  });
});

app.post('/api/customers', (req, res) => {

  const { FirstName, LastName, Phone, Email, IdentityNo, Address, BirthDate } = req.body;
  
  const sql = `
    INSERT INTO Customer (FirstName, LastName, Phone, Email, IdentityNo, Address, BirthDate)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(sql, [FirstName, LastName, Phone, Email, IdentityNo, Address, BirthDate], (err, result) => {
    if (err) {
      console.error('Error inserting customer:', err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Customer added', id: result.insertId });
  });
});

app.put('/api/customers/:id', (req, res) => {
  const customerId = req.params.id;
  const { FirstName, LastName, Phone, Email, IdentityNo, Address, BirthDate } = req.body;
  const sql = `
    UPDATE Customer
    SET FirstName = ?, LastName = ?, Phone = ?, Email = ?, IdentityNo = ?, Address = ?, BirthDate = ?
    WHERE CustomerID = ?
  `;
  db.query(sql, [FirstName, LastName, Phone, Email, IdentityNo, Address, BirthDate, customerId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer updated successfully' });
  });
});

app.delete('/api/customers/:id', (req, res) => {
  const sql = 'DELETE FROM Customer WHERE CustomerID = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Customer deleted successfully' });
  });
});

app.get('/api/customers/:id/reservations', (req, res) => {
  const customerId = req.params.id;
  const sql = `
    SELECT Reservation.ReservationID, Reservation.CheckInDate, Reservation.CheckOutDate, Reservation.Status, Room.RoomNumber
    FROM Reservation, Room
    WHERE Reservation.RoomID = Room.RoomID AND Reservation.CustomerID = ?
  `;
  db.query(sql, [customerId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

app.get('/api/reservations', (req, res) => {
  const sql = `
    SELECT R.ReservationID, C.FirstName, C.LastName, R.CheckInDate, R.CheckOutDate, R.Status, R.TotalPrice
    FROM Reservation R
    JOIN Customer C ON R.CustomerID = C.CustomerID
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

app.get('/api/reservations/:id', (req, res) => {
  const reservationId = req.params.id;
  const sql = `
    SELECT R.ReservationID, C.FirstName, C.LastName, Rm.RoomNumber, R.CheckInDate, R.CheckOutDate, R.NumberOfGuests, R.Status, R.TotalPrice
    FROM Reservation R
    JOIN Customer C ON R.CustomerID = C.CustomerID
    JOIN Room Rm ON R.RoomID = Rm.RoomID
    WHERE R.ReservationID = ?
  `;
  db.query(sql, [reservationId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'Reservation not found' });
    res.json(results[0]);
  });
});

app.post('/api/reservations', (req, res) => {
  console.log('=== RESERVATION REQUEST ===');
  console.log('Body:', req.body);
  
  const { CustomerID, RoomID, EmployeeID, CheckInDate, CheckOutDate, NumberOfGuests, Status, TotalPrice } = req.body;
  
  const checkFK = `
    SELECT 
      (SELECT COUNT(*) FROM Customer WHERE CustomerID = ?) as customerExists,
      (SELECT COUNT(*) FROM Room WHERE RoomID = ?) as roomExists,
      (SELECT COUNT(*) FROM Employee WHERE EmployeeID = ?) as employeeExists
  `;
  
  db.query(checkFK, [CustomerID, RoomID, EmployeeID], (err, checkResult) => {
    if (err) {
      console.error('FK Check Error:', err);
      return res.status(500).json({ error: 'Database error during validation' });
    }
    
    const check = checkResult[0];
    console.log('FK Check:', check);
    
    if (check.customerExists === 0) {
      return res.status(400).json({ error: `Customer with ID ${CustomerID} does not exist` });
    }
    if (check.roomExists === 0) {
      return res.status(400).json({ error: `Room with ID ${RoomID} does not exist` });
    }
    if (check.employeeExists === 0) {
      return res.status(400).json({ error: `Employee with ID ${EmployeeID} does not exist` });
    }
    
    const sql = `
      INSERT INTO Reservation (CustomerID, RoomID, EmployeeID, CheckInDate, CheckOutDate, NumberOfGuests, Status, TotalPrice, CreatedDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    db.query(sql, [CustomerID, RoomID, EmployeeID, CheckInDate, CheckOutDate, NumberOfGuests, Status, TotalPrice], (err, result) => {
      if (err) {
        console.error('=== RESERVATION INSERT ERROR ===');
        console.error('Error:', err);
        return res.status(500).json({ error: err.message });
      }
      console.log('=== RESERVATION SUCCESS ===');
      res.status(201).json({ message: 'Reservation inserted successfully', id: result.insertId });
    });
  });
});

app.put('/api/reservations/:id', (req, res) => {
  const { Status, IsPaid } = req.body;
  const sql = 'UPDATE Reservation SET Status=?, IsPaid=? WHERE ReservationID=?';
  db.query(sql, [Status, IsPaid, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Reservation updated successfully' });
  });
});

app.delete('/api/reservations/:id', (req, res) => {
  const sql = 'DELETE FROM Reservation WHERE ReservationID = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Reservation deleted successfully' });
  });
});

app.get('/api/reservations/:id/services', (req, res) => {
  const reservationId = req.params.id;
  const sql = `
    SELECT S.ServiceName, RS.Quantity, RS.UnitPrice
    FROM ReservationService RS
    JOIN Service S ON RS.ServiceID = S.ServiceID
    WHERE RS.ReservationID = ?
  `;
  db.query(sql, [reservationId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

app.post('/api/reservations/:id/services', (req, res) => {
  const reservationId = req.params.id;
  const { ServiceID, Quantity, UnitPrice } = req.body;
  const sql = 'INSERT INTO ReservationService (ReservationID, ServiceID, Quantity, UnitPrice) VALUES (?, ?, ?, ?)';
  
  db.query(sql, [reservationId, ServiceID, Quantity, UnitPrice], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.status(201).json({ message: 'Reservation service inserted successfully' });
  });
});

app.get('/api/services', (req, res) => {
  const sql = 'SELECT * FROM Service';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

app.get('/api/roomtypes', (req, res) => {
  const sql = 'SELECT * FROM RoomType';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/roomtypes/:id', (req, res) => {
  const sql = 'SELECT * FROM RoomType WHERE TypeID = ?';
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Room type not found' });
    res.json(results[0]);
  });
});

app.put('/api/roomtypes/:id', (req, res) => {
  const { TypeName, BasePrice, Capacity, Description } = req.body;
  const sql = 'UPDATE RoomType SET TypeName=?, BasePrice=?, Capacity=?, Description=? WHERE TypeID=?';
  db.query(sql, [TypeName, BasePrice, Capacity, Description, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Room type updated successfully' });
  });
});

app.delete('/api/roomtypes/:id', (req, res) => {
  const sql = 'DELETE FROM RoomType WHERE TypeID = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Room type deleted successfully' });
  });
});

app.post('/api/services', (req, res) => {
  const { ServiceName, Price, Description, HotelID } = req.body;
  const sql = 'INSERT INTO Service (ServiceName, Price, Description, HotelID) VALUES (?, ?, ?, ?)';
  db.query(sql, [ServiceName, Price, Description, HotelID], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Service added successfully', id: result.insertId });
  });
});

app.put('/api/services/:id', (req, res) => {
  const { ServiceName, Price, Description } = req.body;
  const sql = 'UPDATE Service SET ServiceName=?, Price=?, Description=? WHERE ServiceID=?';
  db.query(sql, [ServiceName, Price, Description, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Service updated successfully' });
  });
});

app.delete('/api/services/:id', (req, res) => {
  const sql = 'DELETE FROM Service WHERE ServiceID = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Service deleted successfully' });
  });
});

app.post('/api/hotels', (req, res) => {
  const { Name, Address, Phone, StarRating } = req.body;
  const sql = 'INSERT INTO Hotel (Name, Address, Phone, StarRating) VALUES (?, ?, ?, ?)';
  db.query(sql, [Name, Address, Phone, StarRating], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Hotel added successfully', id: result.insertId });
  });
});

app.put('/api/hotels/:id', (req, res) => {
  const { Name, Address, Phone, StarRating } = req.body;
  const sql = 'UPDATE Hotel SET Name=?, Address=?, Phone=?, StarRating=? WHERE HotelID=?';
  db.query(sql, [Name, Address, Phone, StarRating, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Hotel updated successfully' });
  });
});

app.delete('/api/hotels/:id', (req, res) => {
  const sql = 'DELETE FROM Hotel WHERE HotelID = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Hotel deleted successfully' });
  });
});

app.get('/api/payments', (req, res) => {
  const sql = 'SELECT * FROM Payment';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

app.get('/api/reservations/:id/payments', (req, res) => {
  const reservationId = req.params.id;
  const sql = 'SELECT PaymentID, Amount, PaymentDate, Method, Description FROM Payment WHERE ReservationID = ?';
  db.query(sql, [reservationId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

app.post('/api/payments', (req, res) => {
  console.log('=== PAYMENT REQUEST ===');
  console.log('Body:', req.body);
  
  const { ReservationID, Amount, Method, Description } = req.body;
  
  console.log('ReservationID:', ReservationID);
  console.log('Amount:', Amount);
  console.log('Method:', Method);
  console.log('Description:', Description);
  
  const sql = 'INSERT INTO Payment (ReservationID, Amount, PaymentDate, Method, Description) VALUES (?, ?, NOW(), ?, ?)';
  
  console.log('SQL Query:', sql);
  
  db.query(sql, [ReservationID, Amount, Method, Description], (err, result) => {
    if (err) {
      console.error('=== PAYMENT ERROR ===');
      console.error('Error Code:', err.code);
      console.error('Error Message:', err.message);
      console.error('SQL State:', err.sqlState);
      console.error('Full Error:', err);
      return res.status(500).json({ 
        error: err.message,
        code: err.code,
        sqlState: err.sqlState
      });
    }
    console.log('=== PAYMENT SUCCESS ===');
    console.log('Insert ID:', result.insertId);
    res.status(201).json({ 
      message: 'Payment inserted successfully', 
      id: result.insertId 
    });
  });
});

app.get('/api/reports/revenue-sp', (req, res) => {
  const sql = 'CALL CalculateMonthlyRevenue()'; 
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing SP:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results[0]);
  });
});

app.get('/api/reports/oldest-customer', (req, res) => {
  const sql = `
    SELECT 
      CustomerID,
      CONCAT(FirstName, ' ', LastName) as FullName,
      BirthDate,
      TIMESTAMPDIFF(YEAR, BirthDate, CURDATE()) as Age
    FROM Customer
    WHERE BirthDate IS NOT NULL
    ORDER BY BirthDate ASC
    LIMIT 1
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'No customers found' });
    res.json(results[0]);
  });
});

app.get('/api/reports/available-rooms', (req, res) => {
  const { checkIn, checkOut } = req.query;
  if (!checkIn || !checkOut) {
    return res.status(400).json({ error: 'checkIn and checkOut dates required' });
  }
  const sql = `
    SELECT 
      Rm.RoomID, Rm.RoomNumber, Rm.Floor,
      RT.TypeName, RT.BasePrice, RT.Capacity
    FROM Room Rm
    INNER JOIN RoomType RT ON Rm.TypeID = RT.TypeID
    WHERE Rm.Status = 'Available'
      AND Rm.RoomID NOT IN (
        SELECT RoomID FROM Reservation 
        WHERE NOT (CheckOutDate <= ? OR CheckInDate >= ?)
          AND Status IN ('Confirmed', 'CheckedIn')
      )
    ORDER BY RT.BasePrice
  `;
  db.query(sql, [checkIn, checkOut], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/reports/top-customers', (req, res) => {
  const limit = req.query.limit || 10;
  const sql = `
    SELECT 
      C.CustomerID, C.FirstName, C.LastName, C.Email,
      COUNT(R.ReservationID) as TotalReservations,
      SUM(R.TotalPrice) as TotalSpent,
      AVG(R.TotalPrice) as AverageSpent,
      MAX(R.CheckInDate) as LastVisit
    FROM Customer C
    INNER JOIN Reservation R ON C.CustomerID = R.CustomerID
    WHERE R.Status IN ('Confirmed', 'CheckedIn', 'CheckedOut')
    GROUP BY C.CustomerID, C.FirstName, C.LastName, C.Email
    HAVING TotalSpent > 0
    ORDER BY TotalSpent DESC
    LIMIT ?
  `;
  db.query(sql, [parseInt(limit)], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/reports/employee-performance', (req, res) => {
  const sql = `
    SELECT 
      E.EmployeeID, E.FirstName, E.LastName, E.Role, E.Salary,
      COUNT(R.ReservationID) as TotalReservations,
      SUM(R.TotalPrice) as TotalRevenue,
      AVG(R.TotalPrice) as AverageReservation
    FROM Employee E
    LEFT JOIN Reservation R ON E.EmployeeID = R.EmployeeID
    WHERE E.Role IN ('Receptionist', 'Manager', 'General Manager')
    GROUP BY E.EmployeeID, E.FirstName, E.LastName, E.Role, E.Salary
    ORDER BY TotalRevenue DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/reports/occupancy-rate', (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'startDate and endDate required' });
  }
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM Room) as TotalRooms,
      (SELECT COUNT(DISTINCT RoomID) 
       FROM Reservation 
       WHERE CheckInDate <= ? AND CheckOutDate >= ?
         AND Status IN ('Confirmed', 'CheckedIn')
      ) as OccupiedRooms,
      ROUND((SELECT COUNT(DISTINCT RoomID) 
             FROM Reservation 
             WHERE CheckInDate <= ? AND CheckOutDate >= ?
               AND Status IN ('Confirmed', 'CheckedIn')
            ) * 100.0 / (SELECT COUNT(*) FROM Room), 2
      ) as OccupancyPercentage
  `;
  db.query(sql, [endDate, startDate, endDate, startDate], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

app.get('/api/reports/monthly-revenue', (req, res) => {
  const sql = `
    SELECT 
      DATE_FORMAT(PaymentDate, '%Y-%m') as Month,
      DATE_FORMAT(PaymentDate, '%M %Y') as MonthName,
      COUNT(DISTINCT ReservationID) as TotalReservations,
      COUNT(*) as TotalPayments,
      SUM(Amount) as TotalRevenue,
      AVG(Amount) as AveragePayment
    FROM Payment
    WHERE PaymentDate >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    GROUP BY Month, MonthName
    ORDER BY Month DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/reports/popular-room-types', (req, res) => {
  const sql = `
    SELECT 
      RT.TypeID, RT.TypeName, RT.BasePrice, RT.Capacity,
      COUNT(R.ReservationID) as TotalBookings,
      SUM(R.TotalPrice) as TotalRevenue,
      AVG(R.TotalPrice) as AverageRevenue,
      COUNT(DISTINCT R.CustomerID) as UniqueCustomers
    FROM RoomType RT
    INNER JOIN Room Rm ON RT.TypeID = Rm.TypeID
    INNER JOIN Reservation R ON Rm.RoomID = R.RoomID
    WHERE R.Status IN ('Confirmed', 'CheckedIn', 'CheckedOut')
    GROUP BY RT.TypeID, RT.TypeName, RT.BasePrice, RT.Capacity
    ORDER BY TotalBookings DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/reports/service-statistics', (req, res) => {
  const sql = `
    SELECT 
      S.ServiceID, S.ServiceName, S.Price,
      COALESCE(COUNT(RS.ResServiceID), 0) as TimesOrdered,
      COALESCE(SUM(RS.Quantity), 0) as TotalQuantity,
      COALESCE(SUM(RS.Quantity * RS.UnitPrice), 0) as TotalRevenue
    FROM Service S
    LEFT JOIN ReservationService RS ON S.ServiceID = RS.ServiceID
    GROUP BY S.ServiceID, S.ServiceName, S.Price
    ORDER BY TotalRevenue DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/reports/reservation-summary', (req, res) => {
  const sql = `
    SELECT 
      Status,
      COUNT(*) as ReservationCount,
      SUM(TotalPrice) as TotalRevenue,
      AVG(TotalPrice) as AveragePrice,
      AVG(DATEDIFF(CheckOutDate, CheckInDate)) as AvgStayDays,
      SUM(CASE WHEN IsPaid = TRUE THEN 1 ELSE 0 END) as PaidCount,
      SUM(CASE WHEN IsPaid = FALSE THEN 1 ELSE 0 END) as UnpaidCount
    FROM Reservation
    GROUP BY Status
    ORDER BY ReservationCount DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/reports/payment-methods', (req, res) => {
  const sql = `
    SELECT 
      Method,
      COUNT(*) as TransactionCount,
      SUM(Amount) as TotalAmount,
      AVG(Amount) as AverageAmount,
      ROUND(SUM(Amount) * 100.0 / (SELECT SUM(Amount) FROM Payment), 2) as PercentageOfTotal
    FROM Payment
    GROUP BY Method
    ORDER BY TotalAmount DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/customers/:id/detailed-history', (req, res) => {
  const sql = `
    SELECT 
      R.ReservationID, R.CheckInDate, R.CheckOutDate, R.Status, R.TotalPrice,
      DATEDIFF(R.CheckOutDate, R.CheckInDate) as StayDuration,
      Rm.RoomNumber, RT.TypeName as RoomType,
      CONCAT(E.FirstName, ' ', E.LastName) as HandledBy,
      (SELECT COUNT(*) FROM ReservationService RS WHERE RS.ReservationID = R.ReservationID) as ServicesCount,
      (SELECT SUM(Amount) FROM Payment P WHERE P.ReservationID = R.ReservationID) as TotalPaid
    FROM Reservation R
    INNER JOIN Room Rm ON R.RoomID = Rm.RoomID
    INNER JOIN RoomType RT ON Rm.TypeID = RT.TypeID
    INNER JOIN Employee E ON R.EmployeeID = E.EmployeeID
    WHERE R.CustomerID = ?
    ORDER BY R.CheckInDate DESC
  `;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/reports/upcoming-checkins', (req, res) => {
  const sql = `
    SELECT 
      R.ReservationID, R.CheckInDate, R.CheckOutDate,
      CONCAT(C.FirstName, ' ', C.LastName) as CustomerName,
      C.Phone, C.Email,
      Rm.RoomNumber, RT.TypeName,
      R.NumberOfGuests,
      DATEDIFF(R.CheckInDate, CURDATE()) as DaysUntilCheckIn
    FROM Reservation R
    INNER JOIN Customer C ON R.CustomerID = C.CustomerID
    INNER JOIN Room Rm ON R.RoomID = Rm.RoomID
    INNER JOIN RoomType RT ON Rm.TypeID = RT.TypeID
    WHERE R.CheckInDate BETWEEN CURDATE() AND LAST_DAY(CURDATE())
      AND R.Status = 'Confirmed'
    ORDER BY R.CheckInDate ASC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/sp/monthly-revenue', (req, res) => {
  db.query('CALL CalculateMonthlyRevenue()', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});


app.get('/api/sp/available-rooms', (req, res) => {
  const { checkIn, checkOut } = req.query;
  if (!checkIn || !checkOut) {
    return res.status(400).json({ error: 'checkIn and checkOut required' });
  }
  db.query('CALL GetAvailableRooms(?, ?)', [checkIn, checkOut], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});


app.get('/api/sp/customer-stats/:id', (req, res) => {
  db.query('CALL GetCustomerStatistics(?)', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0][0] || {});
  });
});


app.get('/api/sp/reservation-total/:id', (req, res) => {
  const sql = `
    CALL CalculateReservationTotal(?, @roomTotal, @serviceTotal, @grandTotal);
    SELECT @roomTotal as RoomTotal, @serviceTotal as ServiceTotal, @grandTotal as GrandTotal;
  `;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[1][0]);
  });
});


app.put('/api/sp/update-room-status/:id', (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'status is required' });
  }
  db.query('CALL UpdateRoomStatusWithLog(?, ?)', [req.params.id, status], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0][0]);
  });
});


app.get('/api/debug/all-ids', (req, res) => {
  const sql = `
    SELECT 
      (SELECT JSON_ARRAYAGG(ReservationID) FROM Reservation) as reservations,
      (SELECT JSON_ARRAYAGG(CustomerID) FROM Customer) as customers,
      (SELECT JSON_ARRAYAGG(RoomID) FROM Room) as rooms,
      (SELECT JSON_ARRAYAGG(EmployeeID) FROM Employee) as employees,
      (SELECT JSON_ARRAYAGG(TypeID) FROM RoomType) as roomTypes
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});