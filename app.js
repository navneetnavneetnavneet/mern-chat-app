require("dotenv").config({
  path: "./.env",
});
const express = require("express");
const { server, app } = require("./socket/socket");
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
app.use("/api/status", require("./routes/statusRoutes"));

// error handling
app.all("*", (req, res, next) => {
  return next(new ErrorHandler(`Requested URL Not Found ${req.url}`, 404));
});
app.use(generateErrors);

// create server
server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
