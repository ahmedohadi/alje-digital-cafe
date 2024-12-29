import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import io from "socket.io-client";
import "../fonts.css"; // Custom font
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


const socket = io("https://alje-digital-cafe-890211ee848f.herokuapp.com/"); // Backend URL

// const socket = io("https://git.heroku.com/alje-digital-cafe.git");

const Admin = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", options: "" });
  const [image, setImage] = useState(null);
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

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleAddItem = async () => {
    if (newItem.name && image) {
      const formData = new FormData();
      formData.append("image", image);

      try {
        const response = await fetch("http://localhost:4000/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          const itemToAdd = {
            ...newItem,
            options: newItem.options.split(",").map((opt) => opt.trim()),
            image: data.imageUrl,
          };
          socket.emit("addMenuItem", itemToAdd);
          setNewItem({ name: "", options: "" });
          setImage(null);
        } else {
          console.error("Image upload failed.");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
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
    paddingTop: "70px",
    paddingBottom: "70px",
  };

  return (
    <div className="custom-font">
      <div className="container mt-5" style={contentStyle}>
        <header style={headerStyle}>
          <h1 className="custom-font  header-title " style={{ color: "gray" }}>Admin Panel</h1>
          <img className="header-imge" src="/logo3.png" alt="Logo" style={{ height: "50px" }} />
        </header>
        <div className="form-group row">
          <label htmlFor="name" className="col-sm-2 col-form-label">
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
          <label htmlFor="options" className="col-sm-2 col-form-label">
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
          <label htmlFor="formFileSm" className="col-sm-2 col-form-label">
            Image
          </label>
          <div className="col-sm-10">
            <div className="mb-3">
              <input
                className="form-control form-control-sm"
                id="formFileSm"
                type="file"
                onChange={handleImageChange}
              />
            </div>
            {image && <p className="mt-2">{image.name}</p>}
          </div>
        </div>

        <div className="d-flex justify-content-center">
          <button
            className="btn btn-secondary"
            style={{
              backgroundColor: "rgba(66, 136, 148, 0.89)",
              border: "none",
              borderRadius: "10px",
              padding: "10px 20px",
              fontSize: "18px",
              cursor: "pointer",
            }}
            onClick={handleAddItem}
          >
            Submit
          </button>
        </div>

        <hr />
        {menuItems.map((item, index) => (
          <div key={index} className="card my-2">
            <div className="card-body">
              <h5 className="card-title">{item.name}</h5>
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="img-fluid"
                  style={{ maxHeight: "200px", maxWidth: "100%" }}
                />
              )}
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
          <div
            className="modal show"
            style={{ display: "block" }}
            tabIndex="-1"
          >
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
