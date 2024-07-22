import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { io } from "socket.io-client";
import '../fonts.css';
import './Admin.css';

const socket = io("http://localhost:4000"); // Adjust the URL to match your backend server

const Admin = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", options: "" });
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    socket.on("initialMenuItems", (initialMenuItems) => {
      setMenuItems(initialMenuItems);
    });

    socket.on("menuItemAdded", (addedItem) => {
      setMenuItems((prevMenuItems) => [...prevMenuItems, addedItem]);
    });

    socket.on("menuItemDeleted", (deletedItem) => {
      setMenuItems((prevMenuItems) =>
        prevMenuItems.filter((item) => item.name !== deletedItem.name)
      );
    });

    return () => {
      socket.off("initialMenuItems");
      socket.off("menuItemAdded");
      socket.off("menuItemDeleted");
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  const handleAddItem = () => {
    if (newItem.name) {
      const itemToAdd = {
        ...newItem,
        options: newItem.options.split(",").map((opt) => opt.trim()),
      };
      socket.emit("addMenuItem", itemToAdd);
      setNewItem({ name: "", options: "" });
    }
  };

  const handleDeleteItem = (item) => {
    setItemToDelete(item);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteItem = () => {
    socket.emit("deleteMenuItem", itemToDelete);
    setShowDeleteConfirmation(false);
    setItemToDelete(null);
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
    paddingTop: "70px", // Add padding to prevent content from being hidden behind the header
    paddingBottom: "70px", // Add padding to prevent content from being hidden behind the footer
  };

  const cardStyle = {
    textAlign: "center", // Center text content within the card
  };

  return (
    <div  className="custom-font">
    <div className="container mt-5" style={contentStyle}>
      <header style={headerStyle} >
        <h1 className="custom-font  header-title " style={{color:"gray" }}>Admin Panel</h1>
        <img className="header-imge" src="/logo3.png" alt="Logo" style={{ height: "50px" }} />
      </header>
      <div className="form-group row">
        <label htmlFor="name" className="col-sm-2 col-form-label"  style={{ marginLeft:"10px"}}>
          Item Name
        </label>
        <div className="col-sm-10">
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={newItem.name}
            onChange={handleInputChange}
          />
        </div>
      </div>
      <div className="form-group row">
        <label
          htmlFor="options"
          className="col-sm-2 col-form-label"
          style={{ whiteSpace: "nowrap", marginLeft:"5px" }}
        >
          Options (comma separated)
        </label>
        <div className="col-sm-10">
          <input
            type="text"
            className="form-control"
            id="options"
            name="options"
            value={newItem.options}
            onChange={handleInputChange}
          />
        </div>
      </div>
      <div className="form-group row">
        <div className="col-sm-12 text-center">
          <button
            className="btn btn-primary"
            onClick={handleAddItem}
            style={{
              backgroundColor: "rgba(66, 136, 148, 0.89)",
              border: "none",
              padding: "15px 30px",
              fontSize: "18px",
            }}
          >
            Add New Item
          </button>
        </div>
      </div>
      <hr />
      {menuItems.map((item, index) => (
        <div key={index} className="card my-2" style={cardStyle}>
          <div className="card-body">
            <h5 className="card-title">{item.name}</h5>
            {item.options && item.options.length > 0 && (
              <ul>
                {item.options.map((option, idx) => (
                  <li key={idx}>{option}</li>
                ))}
              </ul>
            )}
            <button
              className="btn btn-danger"
              onClick={() => handleDeleteItem(item)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
      {showDeleteConfirmation && (
        <div className="modal show" style={{ display: "block" }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowDeleteConfirmation(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this item?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteConfirmation(false)}
                >
                  No
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmDeleteItem}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
       <footer style={footerStyle}>
          <p>&copy; 2024 Abdul Latif Jameel Café. All Rights Reserved.</p>
        </footer>
    </div>
    </div>
  );
};

export default Admin;
