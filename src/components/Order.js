import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { io } from "socket.io-client";
import '../fonts.css';
import './Admin.css';

const socket = io("http://localhost:4000"); // Adjust the URL to match your backend server

const Order = () => {
  const [orders, setOrders] = useState([]);
  const notificationSound = useRef(null); // Ref for audio element

  useEffect(() => {
    notificationSound.current = new Audio("/NotificationSound.mp3");

    socket.on("initialOrders", (initialOrders) => {
      setOrders(initialOrders);
    });

    socket.on("orderReceived", (order) => {
      setOrders((prevOrders) => [...prevOrders, order]);
      handleNotificationSound();
      toast.success("New order received!");
    });

    return () => {
      socket.off("initialOrders");
      socket.off("orderReceived");
    };
  }, []);

  const handleNotificationSound = () => {
    if (notificationSound.current) {
      notificationSound.current.play().catch((error) => {
        console.error("Failed to play notification sound:", error);
      });
    }
  };

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
      options: item.options.join(", "),
      temperature: item.temperature,
    }));
  };

  const headerStyle = {
    position: "fixed",
    top: 0,
    width: "100%",
    left: 0,
    backgroundColor: "rgba(230, 238, 242)",
    color: "gray", // Change the text color to gray
    textAlign: "center",
    padding: "10px 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: "20px",
    paddingRight: "20px",
    zIndex: 1000,
  };
  

 
  const footerStyle = {
    position: "fixed",
    bottom: 0,
    width: "100%",
    left: 0,
    backgroundColor: "rgba(66, 136, 148, 0.89)",
    color: "white",
    textAlign: "center",
    padding: "10px 0",
  };

  const contentStyle = {
    paddingTop: "70px", // Add padding to prevent content from being hidden behind the header
    paddingBottom: "70px", // Add padding to prevent content from being hidden behind the footer
  };

  // Button styling
  const buttonStyle = {
    backgroundColor: "rgba(66, 136, 148, 0.89)", // Set the background color to blue
    color: "white", // Set the text color to white
    border: "none", // Remove the border
    padding: "10px 20px", // Add some padding
    cursor: "pointer", // Change the cursor on hover
    borderRadius: "100px", // Add rounded corners
  };

  const buttonHoverStyle = {
    backgroundColor: "rgba(24, 112, 134, 1)",
  };

  return (
    
    <div className=" custom-font  container mt-5" style={contentStyle}>
      <header style={headerStyle}>
        <h1 className=" custom-font  header-title" style={{  color:"gray" }}>ORDER</h1>
        <img className="header-imge"  src="/logo3.png" alt="Logo" style={{ height: "50px" }} />
      </header>
      <ToastContainer />

      <div className="d-flex flex-column align-items-center">
        {/* Center the cards */}
        {orders.map((order, index) => {
          const isSpecialDepartment =
            order.department === "Chairman Office" ||
            order.department === "CEO Office";
          const borderColor = isSpecialDepartment ? "red" : "green";

          return (
            <div
              key={index}
              className="card my-2"
              style={{
                width: "500px",
                position: "relative",
                border: `2px solid ${borderColor}`, // Set border color based on department
              }}
            >
              <div className="card-body text-center">
                <h5 className="card-title">
                  {order.name} - {order.department}
                </h5>
                <ul className="list-group list-group-flush">
                  {formatOrderItems(order.items, order.temperature).map(
                    (item, idx) => (
                      <li key={idx} className="list-group-item text-center">
                        {item.name} ({item.options}) -{" "}
                        {item.temperature || "Default"}
                      </li>
                    )
                  )}
                </ul>
                {order.comment && (
                  <p className="mt-3 text-center">
                    <strong>Comment:</strong> {order.comment}
                  </p>
                )}
                <button
                  className="btn mt-3"
                  onClick={() => handleConfirmReceipt(index)}
                  style={buttonStyle}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      buttonHoverStyle.backgroundColor)
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      buttonStyle.backgroundColor)
                  }
                >
                  Confirm Receipt
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <footer className="custom-font  footer-section" style={footerStyle}>
        <p >&copy; 2024 Abdul Latif Jameel Café. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Order;
