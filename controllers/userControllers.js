const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const User = require("../models/userModels");
const { sendToken } = require("../utils/SendToken");

module.exports.homePage = catchAsyncErrors(async (req, res, next) => {
  res.json({ message: "route working !" });
});

module.exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, profileImage } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorHandler("All fields are required !", 500));
  }

  const alreadyExists = await User.findOne({ email });

  if (alreadyExists) {
    return next(
      new ErrorHandler(
        "User already exists with this email address, Please Login !",
        500
      )
    );
  }

  const user = await User.create({
    name,
    email,
    password,
    profileImage,
  });

  if (!user) {
    new ErrorHandler("User not created !", 500);
  }

  sendToken(user, 201, res);
});

module.exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("All fields are required !", 500));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(
      new ErrorHandler("User not found with this email address !", 404)
    );
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return next(new ErrorHandler("Wrong Creadentials !", 500));
  }

  sendToken(user, 200, res);
});
