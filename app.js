require("dotenv").config({
  path: "./.env",
});
const express = require("express");
const { server, app } = require("./socket/socket");
const logger = require("morgan");
const ErrorHandler = require("./utils/ErrorHandler");
const { generateErrors } = require("./middlewares/errors.middleware");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fileupload = require("express-fileupload");

const userRouter = require("./routes/user.routes");
const chatRouter = require("./routes/chat.routes");
const messageRouter = require("./routes/message.routes");
const statusRouter = require("./routes/status.routes");

// db connection
require("./config/db.config").connectDatabase();

// cloudinary configure
require("./config/cloudinary.config");

// cors
app.use(cors({ origin: process.env.REACT_BASE_URL, credentials: true }));

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
app.use("/api/users", userRouter);
app.use("/api/chats", chatRouter);
app.use("/api/messages", messageRouter);
app.use("/api/status", statusRouter);

// error handling
app.all("*", (req, res, next) => {
  return next(new ErrorHandler(`Requested URL Not Found ${req.url}`, 404));
});
app.use(generateErrors);

// create server
server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
