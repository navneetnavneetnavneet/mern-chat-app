const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const User = require("../models/userModels");

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

  res.status(201).json(user);
});
