const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const path = require("path");

const app = express();
const server = http.createServer(app);

// Unified CORS configuration
const allowedOrigins = [
  "http://localhost:3000", // Local frontend during development
  "https://ahmedohadi.github.io", // GitHub Pages frontend
  "https://alje-digital-cafe-890211ee848f.herokuapp.com", // Heroku backend
];

const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
  credentials: true,
};

// Apply CORS middleware globally
app.use(cors(corsOptions));

// Socket.IO CORS configuration
const io = socketIo(server, {
  cors: corsOptions,
});

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Image upload handling
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Data
let orders = [];
let menuItems = [
  { name: "Espresso", options: [] },
  { name: "Black Coffee", options: [] },
  { name: "Cappuccino", options: [] },
  // Add more items here...
];

// Socket.IO event handling
io.on("connection", (socket) => {
  console.log("New client connected");

  // Emit initial data to the client
  socket.emit("initialMenuItems", menuItems);
  socket.emit("initialOrders", orders);

  // Handle new orders
  socket.on("newOrder", (order) => {
    const newOrder = { ...order, id: uuidv4() };
    orders.push(newOrder);
    io.emit("orderReceived", newOrder);
  });

  // Handle order confirmation
  socket.on("confirmReceipt", (orderId) => {
    orders = orders.filter((order) => order.id !== orderId);
    io.emit("orderConfirmed", orderId);
  });

  // Add new menu items
  socket.on("addMenuItem", (item) => {
    menuItems.push(item);
    io.emit("menuItemAdded", item);
  });

  // Delete menu items
  socket.on("deleteMenuItem", (item) => {
    menuItems = menuItems.filter((menuItem) => menuItem.name !== item.name);
    io.emit("menuItemDeleted", item);
  });

  // Handle client disconnection
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

// Error handling middleware (optional but recommended)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Set the port to the environment variable PORT or default to 4000
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
