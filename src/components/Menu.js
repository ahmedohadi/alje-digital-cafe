import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000'); // Adjust the URL to match your backend server

const Menu = () => {
  const [order, setOrder] = useState({
    name: '',
    department: '',
    items: [],
    temperature: {}, // Add state to handle temperature options separately
  });
  const [menuItems, setMenuItems] = useState([]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrder({ ...order, [name]: value });
  };

  const handleCheckboxChange = (e, item) => {
    const { name, checked } = e.target;
    let items = order.items;

    if (checked) {
      items.push({ ...item, option: name });
    } else {
      items = items.filter(
        (orderItem) => orderItem.name !== item.name || orderItem.option !== name
      );
    }
    setOrder({ ...order, items });
  };

  const handleRadioChange = (e, item) => {
    const { name, value } = e.target;
    setOrder((prevOrder) => ({
      ...prevOrder,
      temperature: { ...prevOrder.temperature, [item.name]: value },
    }));
  };

  const handleEspressoOptionChange = (e, item) => {
    const { value } = e.target;
    setOrder((prevOrder) => ({
      ...prevOrder,
      items: prevOrder.items.filter(orderItem => orderItem.name !== item.name).concat({ ...item, option: value })
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit('newOrder', order); // Emit the order to the backend
    // Optionally clear the form or give user feedback
    setOrder({
      name: '',
      department: '',
      items: [],
      temperature: {},
    });

    // Clear form fields
    document.getElementById("orderForm").reset();
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">Cafe Menu</h1>
      <form id="orderForm" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={order.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="department">Department</label>
          <input
            type="text"
            className="form-control"
            id="department"
            name="department"
            value={order.department}
            onChange={handleChange}
            required
          />
        </div>
        {menuItems.filter(item => item.name !== 'Nescafe with Milk').map((item) => (
          <div key={item.name} className="card my-2">
            <div className="card-body">
              <h5 className="card-title">{item.name}</h5>
              {item.name === 'Espresso'
                ? ['Single', 'Double'].map((option) => (
                    <div key={option} className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        id={`${item.name}-${option}`}
                        name={`${item.name}-option`}
                        value={option}
                        checked={order.items.some(orderItem => orderItem.name === item.name && orderItem.option === option)}
                        onChange={(e) => handleEspressoOptionChange(e, item)}
                      />
                      <label className="form-check-label" htmlFor={`${item.name}-${option}`}>
                        {option}
                      </label>
                    </div>
                  ))
                : item.options
                ? item.options.map((option) => (
                    <div key={option} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`${item.name}-${option}`}
                        name={option}
                        onChange={(e) => handleCheckboxChange(e, item)}
                      />
                      <label className="form-check-label" htmlFor={`${item.name}-${option}`}>
                        {option}
                      </label>
                    </div>
                  ))
                : ['Sugar', 'Milk'].map((option) => (
                    <div key={option} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`${item.name}-${option}`}
                        name={option}
                        onChange={(e) => handleCheckboxChange(e, item)}
                      />
                      <label className="form-check-label" htmlFor={`${item.name}-${option}`}>
                        {option}
                      </label>
                    </div>
                  ))}
              {/* Add Radio Buttons for Ice and Hot Options */}
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  id={`${item.name}-Ice`}
                  name={`${item.name}-temperature`}
                  value="Ice"
                  checked={order.temperature[item.name] === 'Ice'}
                  onChange={(e) => handleRadioChange(e, item)}
                />
                <label className="form-check-label" htmlFor={`${item.name}-Ice`}>
                  Ice
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  id={`${item.name}-Hot`}
                  name={`${item.name}-temperature`}
                  value="Hot"
                  checked={order.temperature[item.name] === 'Hot'}
                  onChange={(e) => handleRadioChange(e, item)}
                />
                <label className="form-check-label" htmlFor={`${item.name}-Hot`}>
                  Hot
                </label>
              </div>
            </div>
          </div>
        ))}
        <button type="submit" className="btn btn-primary btn-block mt-4">
          Submit Order
        </button>
      </form>
    </div>
  );
};

export default Menu;
