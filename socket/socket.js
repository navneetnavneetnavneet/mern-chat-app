const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user is connected", socket.id);

  // Setup user
  socket.on("setup", (userData) => {
    if (!userData || !userData._id) {
      console.error("Invalid user data for setup");
      return;
    }
    socket.join(userData._id); // Join user's personal room
    socket.emit("connected");
    console.log(`User ${userData._id} joined their personal room`);
  });

  // Join a specific room
  socket.on("join-room", (room) => {
    if (!room) {
      console.error("Invalid room");
      return;
    }
    socket.join(room); // Join chat room
    console.log(`User joined room: ${room}`);
  });

  // Handle new message
  socket.on("new-message", (newMessage) => {
    if (!newMessage || !newMessage.chatId || !newMessage.senderId) {
      console.error("Invalid message data received");
      return;
    }

    const { chatId, senderId } = newMessage;
    const chat = newMessage.chatId;

    if (!chat.users || !Array.isArray(chat.users)) {
      return console.error("Chat users not defined or invalid format");
    }

    // console.log("New message received:", newMessage);

    // Broadcast message to other users in the chat
    chat.users.forEach((user) => {
      if (user._id.toString() === senderId._id.toString()) return; // Exclude sender
      socket.emit("msg", newMessage);

      socket.to(user?._id).emit("message-received", newMessage);
    });
  });

  socket.on("disconnecting", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

module.exports = { io, app, server };
