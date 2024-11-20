require("dotenv").config({
  path: "./.env",
});
const express = require("express");
const app = express();
const logger = require("morgan");
const ErrorHandler = require("./utils/ErrorHandler");
const { generateErrors } = require("./middlewares/errors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fileupload = require("express-fileupload");

// db connection
require("./config/db").connectDatabase();

// cors
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// express-fileupload
app.use(fileupload());

// body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// session and cookieParser
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.EXPRESS_SESSION_SECRET,
  })
);
app.use(cookieParser());

// logger
app.use(logger("tiny"));

// routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/chats", require("./routes/chatRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

// error handling
app.all("*", (req, res, next) => {
  return next(new ErrorHandler(`Requested URL Not Found ${req.url}`, 404));
});
app.use(generateErrors);

// create server
const server = app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:5173",
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
