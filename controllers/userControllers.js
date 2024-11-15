const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const User = require("../models/userModel");
const { sendToken } = require("../utils/SendToken");

module.exports.signUpUser = catchAsyncErrors(async (req, res, next) => {
  const { fullName, email, password, gender, profileImage } = req.body;

  if (!fullName || !email || !password || !gender) {
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
    fullName,
    email,
    password,
    gender,
    profileImage,
  });

  if (!user) {
    new ErrorHandler("User not created !", 500);
  }

  sendToken(user, 201, res);
});

module.exports.signInUser = catchAsyncErrors(async (req, res, next) => {
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

module.exports.signOutUser = catchAsyncErrors(async (req, res, next) => {
  res.clearCookie("token");

  res.status(200).json({
    message: "User logout successfull",
  });
});

module.exports.loggedInUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.id);

  if (!user) {
    return next(new ErrorHandler("Please login to access the resource !", 500));
  }

  res.status(200).json(user);
});

module.exports.allUser = catchAsyncErrors(async (req, res, next) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { name: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.id } });

  res.status(200).json(users);
});

module.exports.editUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.id, req.body, { new: true });

  res.status(200).json(user);
});

module.exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.id);

  res.status(200).json({ message: "User delete successfully" });
});
