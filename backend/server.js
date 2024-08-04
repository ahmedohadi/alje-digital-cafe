const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
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
  })
);
 
// Set up storage engine
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });
 
// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
 
let orders = [];
let menuItems = [
  { name: "Espresso", options: ["Single", "Double"] },
  { name: "Black Coffee", options: ["Hot", "Cold", "Sugar", "Milk"] },
  { name: "Cappuccino", options: ["Hot", "Cold", "Sugar"] },
  { name: "Turkish Coffee", options: ["Hot", "Cold", "Sugar", "Milk"] },
  { name: "Special Coffee", options: ["Hot", "Cold", "Sugar", "Milk"] },
  { name: "Latte", options: ["Hot", "Cold", "Sugar"] },
  { name: "Ristretto", options: ["Hot", "Cold", "Sugar", "Milk"] },
  { name: "Arabic Coffee", options: ["Hot", "Cold", "Sugar"] },
  { name: "Flat White", options: ["Hot", "Cold", "Sugar"] },
  { name: "Nescafe", options: ["Hot", "Cold", "Sugar", "Milk"] },
  { name: "Nescafe 3 in 1", options: ["Hot", "Cold", "Sugar", "Milk"] },
  { name: "Green Tea", options: ["Hot", "Cold", "Sugar", "Milk"] },
  { name: "Red Tea", options: ["Hot", "Cold", "Sugar", "Milk"] },
];
 
 
io.on("connection", (socket) => {
  console.log("New client connected");
 
  socket.emit("initialMenuItems", menuItems);
  socket.emit("initialOrders", orders);
 
  socket.on("newOrder", (order) => {
    const newOrder = { ...order, id: uuidv4() };
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
  res.send({ imageUrl: `/uploads/${req.file.filename}` });
});
 
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
 