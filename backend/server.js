const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
    credentials: true
  }
});

// Use CORS middleware
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
  credentials: true
}));

let orders = [];
let menuItems = [
  { name: 'Green Tea' },
  { name: 'Red Tea' },
  { name: 'Milk Tea' },
  { name: 'Espresso', options: ['Single', 'Double'] },
  { name: 'Black Coffee' },
  { name: 'Special Coffee' },
  { name: 'Latte' },
  { name: 'Cappuccino' },
  { name: 'Ristretto' },
  { name: 'Turkish Coffee' },
  { name: 'Arabic Coffee' },
  { name: 'Flat White' },
  { name: 'Nescafe' },
  { name: 'Nescafe 3 in 1' },
];

io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Send existing menu items to the new client
  socket.emit('initialMenuItems', menuItems);

  // Send existing orders to the new client
  socket.emit('initialOrders', orders);

  // Listen for incoming orders from clients
  socket.on('newOrder', (order) => {
    const newOrder = { ...order, id: uuidv4() }; // Assign a unique ID to each order
    console.log('Order received:', newOrder);
    orders.push(newOrder);
    // Broadcast the order to all connected clients (e.g., tea boy)
    io.emit('orderReceived', newOrder);
  });

  // Listen for order confirmation from clients
  socket.on('confirmReceipt', (orderId) => {
    console.log('Order confirmed:', orderId);
    orders = orders.filter(order => order.id !== orderId);
    // Broadcast the confirmed order ID to all connected clients
    io.emit('orderConfirmed', orderId);
  });

  // Listen for adding menu items
  socket.on('addMenuItem', (item) => {
    console.log('Menu item added:', item);
    menuItems.push(item);
    // Broadcast the new menu item to all connected clients
    io.emit('menuItemAdded', item);
  });

  // Listen for deleting menu items
  socket.on('deleteMenuItem', (item) => {
    console.log('Menu item deleted:', item);
    menuItems = menuItems.filter(menuItem => menuItem.name !== item.name);
    // Broadcast the deleted menu item to all connected clients
    io.emit('menuItemDeleted', item);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Example API endpoint
app.get('/api/data', (req, res) => {
  res.json({ message: 'API endpoint accessed successfully' });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
