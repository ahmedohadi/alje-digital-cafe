import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import io from "socket.io-client";
import "../fonts.css"; // Custom font
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const socket = io("https://alje-digital-cafe-890211ee848f.herokuapp.com/"); // Backend URL

const Order = () => {
  const [orders, setOrders] = useState([]);
  const notificationSound = useRef(new Audio("/NotificationSound.mp3"));
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    socket.on("initialOrders", (initialOrders) => {
      setOrders(sortOrders(initialOrders));
    });

    socket.on("orderReceived", (order) => {
      setOrders((prevOrders) => sortOrders([order, ...prevOrders]));
      if (userInteracted) {
        notificationSound.current.play().catch((error) => {
          console.error("Audio playback error:", error);
        });
      }
      toast.success("New order received!");
    });

    socket.on("orderConfirmed", (orderId) => {
      setOrders((prevOrders) =>
        sortOrders(prevOrders.filter((order) => order.id !== orderId))
      );
    });

    return () => {
      socket.off("initialOrders");
      socket.off("orderReceived");
      socket.off("orderConfirmed");
    };
  }, [userInteracted]);

  const sortOrders = (orders) => {
    const priority = { "Chairman Office": 1, "CEO Office": 2 };
    return orders.sort(
      (a, b) => (priority[a.department] || 3) - (priority[b.department] || 3)
    );
  };

  const handleUserInteraction = () => {
    setUserInteracted(true);
  };

  const handleConfirmReceipt = (index) => {
    const orderId = orders[index].id;
    const updatedOrders = orders.filter((_, i) => i !== index);
    setOrders(sortOrders(updatedOrders));
    socket.emit("confirmReceipt", orderId);

    const confirmationMessage = `Order confirmed! ${orders[index].name} - ${orders[index].department}`;
    toast.success(confirmationMessage);
  };

  const formatOrderItems = (items) => {
    const itemMap = items.reduce((acc, item) => {
      if (!acc[item.name]) {
        acc[item.name] = {
          ...item,
          options: {},
          temperature: new Set(),
          quantity: 0,
          sugarQuantities: item.sugarQuantities || {},
        };
      }
      if (item.options) {
        acc[item.name].options = { ...acc[item.name].options, ...item.options };
      }
      if (item.temperature) {
        acc[item.name].temperature.add(item.temperature);
      } else {
        acc[item.name].temperature.add("No temperature specified");
      }
      acc[item.name].quantity += item.quantity || 1;
      return acc;
    }, {});

    return Object.values(itemMap).map((item) => {
      const options = Object.keys(item.options)
        .filter((option) => item.options[option])
        .join(", ");

      const espressoOption =
        item.name === "Espresso" && item.option ? ` (${item.option})` : "";

      return {
        ...item,
        options: options + espressoOption,
        temperature: Array.from(item.temperature).join(", "),
        sugarQuantities: Object.keys(item.sugarQuantities || {})
          .filter((sugarType) => item.sugarQuantities[sugarType] > 0)
          .map(
            (sugarType) => `${sugarType}: ${item.sugarQuantities[sugarType]}`
          )
          .join(", "),
      };
    });
  };

  const headerStyle = {
    position: "fixed",
    top: 0,
    width: "100%",
    left: 0,
    backgroundColor: "rgba(230, 238, 242)",
    color: "gray",
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
    paddingTop: "70px",
    paddingBottom: "70px",
  };

  const buttonStyle = {
    backgroundColor: "rgba(66, 136, 148, 0.89)",
    color: "white",
    border: "none",
    padding: "10px 20px",
    cursor: "pointer",
    borderRadius: "100px",
  };

  const buttonHoverStyle = {
    backgroundColor: "rgba(24, 112, 134, 1)",
  };

  return (
    <div
      className="container mt-5 custom-font"
      style={contentStyle}
      onClick={handleUserInteraction}
      onKeyDown={handleUserInteraction}
    >
      <header style={headerStyle}>
        <h1 className="custom-font">Orders</h1>
        <img
          className="header-imge"
          src="/logo3.png"
          alt="Logo"
          style={{ height: "50px" }}
        />
      </header>
      <ToastContainer />

      <div className="d-flex flex-column align-items-center">
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
                width: "350px",
                margin: "10px",
                border: `2px solid ${borderColor}`,
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                borderRadius: "10px",
              }}
            >
              <div
                className="card-body d-flex flex-column align-items-center custom-font"
                style={{ width: "100%", padding: "2px", textAlign: "center" }}
              >
                <h5 className="card-title">
                  {order.name} - {order.department}
                </h5>
                <ul
                  className="list-group custom-font"
                  style={{ textAlign: "left", width: "100%" }}
                >
                  {formatOrderItems(order.items).map((item, idx) => (
                    <li key={idx} className="list-group-item custom-font">
                      <div className="d-flex justify-content-between">
                        <span>
                          {item.name} ({item.options})
                        </span>
                        <span>
                          x{item.quantity} -{" "}
                          {item.temperature || "No temperature specified"}
                        </span>
                      </div>
                      {item.sugarQuantities && (
                        <>
                          <div>Sugar:</div>
                          <ul>
                            {item.sugarQuantities
                              .split(", ")
                              .map((sugarTypeQuantity) => (
                                <li
                                  key={sugarTypeQuantity}
                                  className="custom-font"
                                >
                                  {sugarTypeQuantity}
                                </li>
                              ))}
                          </ul>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
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
      <footer style={footerStyle} className="custom-font">
        <p>&copy; 2024 Abdul Latif Jameel Café. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Order;
