const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const {v4: uuidv4} = require("uuid");
const multer = require("multer");
const path = require("path");
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
    credentials: true,
  },
});
app.use(
    cors({
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
      credentials: true,
    }),
);
// Set up storage engine
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({storage});

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

let orders = [];
let menuItems = [
  {name: "Espresso", options: []},
  {name: "Black Coffee", options: []},
  {name: "Cappuccino", options: []},
  {name: "Turkish Coffee", options: []},
  {name: "Special Coffee", options: []},
  {name: "Latte", options: []},
  {name: "Ristretto", options: []},
  {name: "Arabic Coffee", options: []},
  {name: "Flat White", options: []},
  {name: "Nescafe", options: []},
  {name: "Nescafe 3 in 1", options: []},
  {name: "Green Tea", options: []},
  {name: "Red Tea", options: []},
  {name: "Water", options: ["Ice", "Warm"]}, // Add water options
  {name: "Ice Cubes", options: []}, // Add ice cube options
];


io.on("connection", (socket) => {
  console.log("New client connected");

  socket.emit("initialMenuItems", menuItems);
  socket.emit("initialOrders", orders);

  socket.on("newOrder", (order) => {
    const newOrder = {...order, id: uuidv4()};
    orders.push(newOrder);
    io.emit("orderReceived", newOrder);
  });

  socket.on("confirmReceipt", (orderId) => {
    orders = orders.filter((order) => order.id !== orderId);
    io.emit("orderConfirmed", orderId);
  });

  socket.on("addMenuItem", (item) => {
    menuItems.push(item);
    io.emit("menuItemAdded", item);
  });

  socket.on("deleteMenuItem", (item) => {
    menuItems = menuItems.filter((menuItem) => menuItem.name !== item.name);
    io.emit("menuItemDeleted", item);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Endpoint for image upload
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  res.send({imageUrl: `/uploads/${req.file.filename}`});
});

// const PORT = process.env.PORT || 4000;
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const functions = require("firebase-functions");

exports.app = functions.https.onRequest(app);

// Server is no longer needed since Firebase Functions handles it.
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
