const jwt = require("jsonwebtoken");
const { catchAsyncErrors } = require("./catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");

module.exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please login to access the resource !", 500));
  }

  const { id } = await jwt.verify(token, process.env.JWT_SECRET);
  req.id = id;
  next();
});
