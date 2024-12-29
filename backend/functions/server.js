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
    origin: [
      "http://localhost:3000", // Local development frontend
      "https://ahmedohadi.github.io", // GitHub Pages frontend
      "https://alje-digital-cafe-890211ee848f.herokuapp.com" // Heroku frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
    credentials: true,
  },
});

// Middleware configuration
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

// CORS middleware
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://ahmedohadi.github.io",
    "https://alje-digital-cafe-890211ee848f.herokuapp.com",
  ],
  credentials: true,
};
app.use(cors(corsOptions));

let orders = [];
let menuItems = [
  { name: "Espresso", options: [] },
  { name: "Black Coffee", options: [] },
  { name: "Cappuccino", options: [] },
  // Add more items here...
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

// Set the port to the environment variable PORT or default to 4000
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
