import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000'); // Adjust the URL to match your backend server

const Order = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    socket.on('initialOrders', (initialOrders) => {
      setOrders(initialOrders);
    });

    socket.on('orderReceived', (order) => {
      setOrders((prevOrders) => [...prevOrders, order]);
      toast.success('New order received!');
    });

    return () => {
      socket.off('initialOrders');
      socket.off('orderReceived');
    };
  }, []);

  const handleConfirmReceipt = (index) => {
    const updatedOrders = orders.filter((_, i) => i !== index);
    setOrders(updatedOrders);
  };

  const formatOrderItems = (items, temperature) => {
    const itemMap = items.reduce((acc, item) => {
      if (!acc[item.name]) {
        acc[item.name] = { ...item, options: [] };
      }
      acc[item.name].options.push(item.option);
      return acc;
    }, {});

    return Object.values(itemMap).map((item) => ({
      ...item,
      options: item.options.join(', '),
      temperature: temperature[item.name],
    }));
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">Orders</h1>
      <ToastContainer />
      {orders.map((order, index) => (
        <div key={index} className="card my-2">
          <div className="card-body">
            <h5 className="card-title">{order.name} - {order.department}</h5>
            <ul className="list-group">
              {formatOrderItems(order.items, order.temperature).map((item, idx) => (
                <li key={idx} className="list-group-item">
                  {item.name} ({item.options}) - {item.temperature || 'Default'}
                </li>
              ))}
            </ul>
            <button
              className="btn btn-success mt-3"
              onClick={() => handleConfirmReceipt(index)}
            >
              Confirm Receipt
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Order;
