// server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// Import models
const { User, Message, Conversation } = require("./models");

// Import routes
const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const adminRoutes = require("./routes/adminRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const chatRoutes = require("./routes/chatRoutes");
const reportRoutes = require("./routes/reportRoutes");

const { authenticateToken, authorizeRole } = require("./middleware/auth");

const app = express();
const server = http.createServer(app);

// Correctly configure CORS for Express
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Correctly configure CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// IMPORTANT: Add io instance to the Express app so it's available in controllers
app.set("io", io);

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/consultai"
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

// Routes
app.get("/", (req, res) => {
  res.json({ message: "API running" });
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reports", reportRoutes);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // This is the correct way to handle user registration to a private room
  socket.on("register", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} registered and joined their personal room.`);
  });

  // NOTE: The 'sendMessage' socket event handler is removed from here.
  // The chatController now handles saving the message to the database
  // and then uses `io.to(recipientId).emit(...)` to send it in real-time.
  // This ensures that the message is always saved before being broadcasted.

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Protected route example - Get current user profile
app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin only route example
app.get(
  "/api/admin/users",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const users = await User.find({}).select("-password");
      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Test route to get all users (for development/testing)
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

// Start server using the HTTP server instance, not the Express app
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
