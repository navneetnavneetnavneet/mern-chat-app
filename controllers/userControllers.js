const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const User = require("../models/userModel");
const { sendToken } = require("../utils/SendToken");
const imagekit = require("../utils/ImageKit").initImageKit();
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../utils/EmailSender");

module.exports.sendOTP = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler("Email is required !", 400));
  }

  const user = await User.findOne({ email });

  if (user?.isVerified) {
    return next(new ErrorHandler("User already exist, Please login !", 400));
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpirationTime = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
  const salt = await bcrypt.genSalt(10);
  const hashedOTP = await bcrypt.hash(otp, salt);

  await User.updateOne(
    { email },
    { otp: hashedOTP, otpExpiration: otpExpirationTime },
    { upsert: true }
  );

  try {
    await sendEmail(email, "Your OTP Code", `Your OTP is ${otp}`);
    res.status(200).json({ message: "OTP sent successfully", otp });
  } catch (error) {
    return next(new ErrorHandler("Email sending error !", 500));
  }
});

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
          { fullName: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.id } });

  res.status(200).json(users);
});

module.exports.fetchAllUser = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find().populate("status");

  res.status(200).json(users);
});

module.exports.editUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.id, req.body, { new: true });

  if (req.files && req.files.profileImage) {
    const validMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];

    if (!validMimeTypes.includes(req.files?.profileImage?.mimetype)) {
      return next(
        new ErrorHandler(
          "Invalid file type. Only JPEG, PNG, JPG and WEBP files are allowed.",
          500
        )
      );
    }

    const maxSize = 2 * 1024 * 1024; // 2MB

    if (req.files?.profileImage?.size > maxSize) {
      return next(
        new ErrorHandler(
          "File size exceeds the 2MB limit, Please select another file !",
          500
        )
      );
    }

    try {
      if (user.profileImage.fileId !== "") {
        await imagekit.deleteFile(user.profileImage?.fileId);
      }
    } catch (error) {
      console.error("Failed to delete old profile image:", error);
    }

    const file = req.files.profileImage;
    const modifiledFileName = uuidv4() + path.extname(file.name);

    const { fileId, url } = await imagekit.upload({
      file: file.data,
      fileName: modifiledFileName,
    });

    user.profileImage = { fileId, url };
  }

  await user.save();

  res.status(200).json(user);
});

module.exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.id);

  res.status(200).json({ message: "User delete successfully" });
});
