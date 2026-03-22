import { useState } from 'react';
import './Customers.css';

export default function Customers() {
  const [customers, setCustomers] = useState([
    {
      customerID: 1,
      firstName: 'John',
      lastName: 'Smith',
      identityNo: '12345678901',
      phone: '+1 555-0123',
      email: 'john.smith@email.com',
      birthDate: '1985-05-15',
      address: '123 Main St, New York, NY'
    },
    {
      customerID: 2,
      firstName: 'Sarah',
      lastName: 'Johnson',
      identityNo: '12345678902',
      phone: '+1 555-0124',
      email: 'sarah.j@email.com',
      birthDate: '1990-08-22',
      address: '456 Oak Ave, Los Angeles, CA'
    },
  ]);

  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    identityNo: '',
    phone: '',
    email: '',
    birthDate: '',
    address: ''
  });

  const handleAddCustomer = () => {
    if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.identityNo) {
      alert('Please fill in required fields: First Name, Last Name, Identity No');
      return;
    }

    const customer = {
      customerID: customers.length + 1,
      ...newCustomer
    };

    setCustomers([...customers, customer]);
    setShowAddCustomer(false);
    setNewCustomer({
      firstName: '',
      lastName: '',
      identityNo: '',
      phone: '',
      email: '',
      birthDate: '',
      address: ''
    });
  };

  const handleUpdateCustomer = () => {
    if (!selectedCustomer.firstName || !selectedCustomer.lastName) {
      alert('Please fill in required fields!');
      return;
    }

    const updatedCustomers = customers.map(c =>
      c.customerID === selectedCustomer.customerID ? selectedCustomer : c
    );

    setCustomers(updatedCustomers);
    setSelectedCustomer(null);
  };

  const handleDeleteCustomer = (customerID) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setCustomers(customers.filter(c => c.customerID !== customerID));
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.identityNo.includes(searchTerm)
  );

  return (
    <div className="customers-page">
      <div className="page-header">
        <h1 className="page-title">Customer Management</h1>
        <button className="btn-add" onClick={() => setShowAddCustomer(true)}>
          + Add Customer
        </button>
      </div>

      <div className="search-section">
        <div className="search-box-large">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, email, or identity number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="customers-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Identity No</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Birth Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <tr key={customer.customerID}>
                  <td>#{customer.customerID}</td>
                  <td className="customer-name">
                    {customer.firstName} {customer.lastName}
                  </td>
                  <td>{customer.identityNo}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.email}</td>
                  <td>{customer.birthDate}</td>
                  <td className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteCustomer(customer.customerID)}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="modal-overlay" onClick={() => setShowAddCustomer(false)}>
          <div className="customer-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAddCustomer(false)}>
              ✕
            </button>

            <h2 className="modal-title">Add New Customer</h2>

            <div className="form-grid">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  placeholder="John"
                  value={newCustomer.firstName}
                  onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={newCustomer.lastName}
                  onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Identity Number *</label>
                <input
                  type="text"
                  placeholder="12345678901"
                  value={newCustomer.identityNo}
                  onChange={(e) => setNewCustomer({ ...newCustomer, identityNo: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  placeholder="+1 555-0123"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="customer@email.com"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Birth Date</label>
                <input
                  type="date"
                  value={newCustomer.birthDate}
                  onChange={(e) => setNewCustomer({ ...newCustomer, birthDate: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label>Address</label>
                <textarea
                  placeholder="Full address..."
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  rows="3"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowAddCustomer(false)}>
                Cancel
              </button>
              <button className="btn-submit" onClick={handleAddCustomer}>
                Add Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="customer-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedCustomer(null)}>
              ✕
            </button>

            <h2 className="modal-title">Edit Customer</h2>

            <div className="form-grid">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  value={selectedCustomer.firstName}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, firstName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  value={selectedCustomer.lastName}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, lastName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Identity Number *</label>
                <input
                  type="text"
                  value={selectedCustomer.identityNo}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, identityNo: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={selectedCustomer.phone}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={selectedCustomer.email}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Birth Date</label>
                <input
                  type="date"
                  value={selectedCustomer.birthDate}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, birthDate: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label>Address</label>
                <textarea
                  value={selectedCustomer.address}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, address: e.target.value })}
                  rows="3"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setSelectedCustomer(null)}>
                Cancel
              </button>
              <button className="btn-submit" onClick={handleUpdateCustomer}>
                Update Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}