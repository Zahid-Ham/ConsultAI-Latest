const { Server } = require("socket.io");

let io;

const userSocketMap = {}; // Maps userId to socketId

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // Use your frontend URL

      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id); // Listen for the 'register' event from the frontend

    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap[userId] = socket.id;

      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    } // Handle user disconnection

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      for (const key in userSocketMap) {
        if (userSocketMap[key] === socket.id) {
          delete userSocketMap[key];

          break;
        }
      }

      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
};

const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

module.exports = {
  initSocket,

  io, // Export the io instance

  getReceiverSocketId,
};
