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
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const port = process.env.PORT || 3000;

const userRouter = require("./routes/user.routes");
const chatRouter = require("./routes/chat.routes");
const messageRouter = require("./routes/message.routes");
const statusRouter = require("./routes/status.routes");

// db connection
require("./config/db.config").connectDatabase();

// cloudinary configure
require("./config/cloudinary.config");

// security middlewares
app.use(helmet());
app.use(cors({ origin: process.env.REACT_BASE_URL, credentials: true }));

// rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// express-fileupload
app.use(fileupload());

// body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// session and cookieParser
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.EXPRESS_SESSION_SECRET,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
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
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
