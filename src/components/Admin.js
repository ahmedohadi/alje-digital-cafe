import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000'); // Adjust the URL to match your backend server

const Admin = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', options: '' });

  useEffect(() => {
    socket.on('initialMenuItems', (initialMenuItems) => {
      setMenuItems(initialMenuItems);
    });

    socket.on('menuItemAdded', (addedItem) => {
      setMenuItems((prevMenuItems) => [...prevMenuItems, addedItem]);
    });

    socket.on('menuItemDeleted', (deletedItem) => {
      setMenuItems((prevMenuItems) => prevMenuItems.filter(item => item.name !== deletedItem.name));
    });

    return () => {
      socket.off('initialMenuItems');
      socket.off('menuItemAdded');
      socket.off('menuItemDeleted');
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  const handleAddItem = () => {
    if (newItem.name) {
      const itemToAdd = { ...newItem, options: newItem.options.split(',').map(opt => opt.trim()) };
      socket.emit('addMenuItem', itemToAdd);
      setNewItem({ name: '', options: '' });
    }
  };

  const handleDeleteItem = (item) => {
    socket.emit('deleteMenuItem', item);
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">Admin</h1>
      <div className="form-group">
        <label htmlFor="name">Item Name</label>
        <input
          type="text"
          className="form-control"
          id="name"
          name="name"
          value={newItem.name}
          onChange={handleInputChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="options">Options (comma separated)</label>
        <input
          type="text"
          className="form-control"
          id="options"
          name="options"
          value={newItem.options}
          onChange={handleInputChange}
        />
      </div>
      <button className="btn btn-primary mb-4" onClick={handleAddItem}>
        Add Item
      </button>
      <hr />
      {menuItems.map((item, index) => (
        <div key={index} className="card my-2">
          <div className="card-body">
            <h5 className="card-title">{item.name}</h5>
            {item.options && item.options.length > 0 && (
              <ul>
                {item.options.map((option, idx) => (
                  <li key={idx}>{option}</li>
                ))}
              </ul>
            )}
            <button className="btn btn-danger" onClick={() => handleDeleteItem(item)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Admin;
