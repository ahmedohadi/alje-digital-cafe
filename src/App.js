

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import io from 'socket.io-client';
import Menu from './components/Menu';
import Order from './components/Order';
import Admin from './components/Admin';

const socket = io("https://alje-digital-cafe-890211ee848f.herokuapp.com/");  // Backend URL

function App() {
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    // Listen for the initial menu items sent by the backend
    socket.on("initialMenuItems", (items) => {
      console.log("Received menu items:", items);  // Log to verify the received data
      setMenuItems(items);  // Update state with the menu items
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.off("initialMenuItems");
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/menu" element={<Menu menuItems={menuItems} />} />
        <Route path="/order" element={<Order />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/" element={<Menu menuItems={menuItems} />} />
        <Route path="*" element={<Menu menuItems={menuItems} />} />
      </Routes>
    </Router>
  );
}

export default App;
