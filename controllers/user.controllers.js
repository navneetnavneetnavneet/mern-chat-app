const {
  catchAsyncErrors,
} = require("../middlewares/catchAsyncErrors.middleware.");
const ErrorHandler = require("../utils/ErrorHandler");
const userModel = require("../models/user.model");
const blacklistTokenModel = require("../models/blacklistToken.model");
const { validationResult } = require("express-validator");
const { sendEmail } = require("../utils/EmailSender");
const { sendToken } = require("../utils/SendToken");
const bcrypt = require("bcryptjs");
const imagekit = require("../config/imagekit.config").initImageKit();
const { v4: uuidv4 } = require("uuid");
const path = require("path");

module.exports.sendOTP = catchAsyncErrors(async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  const user = await userModel.findOne({ email });

  if (user?.isVerified) {
    return next(new ErrorHandler("User already exist, Please login !", 400));
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpirationTime = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
  const salt = await bcrypt.genSalt(10);
  const hashedOTP = await bcrypt.hash(otp, salt);

  await userModel.updateOne(
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
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullName, email, password, gender, profileImage, dateOfBirth, otp } =
    req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return next(new ErrorHandler("User not found !", 404));
  }

  const isValidOTP = await bcrypt.compare(otp, user.otp);

  if (!isValidOTP || user.otpExpiration < new Date()) {
    return next(new ErrorHandler("Invalid or expired OTP !", 400));
  }

  if (user?.isVerified) {
    return next(
      new ErrorHandler(
        "User already verified and registerd, Please login !",
        400
      )
    );
  }

  user.fullName = fullName;
  user.password = password;
  user.gender = gender;
  user.dateOfBirth = dateOfBirth;
  user.isVerified = true;
  user.otp = null;
  user.otpExpiration = null;

  await user.save();

  sendToken(user, 201, res);
});

module.exports.signInUser = catchAsyncErrors(async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const user = await userModel.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password !", 401));
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return next(new ErrorHandler("Invalid email or password !", 401));
  }

  sendToken(user, 200, res);
});

module.exports.signOutUser = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  await blacklistTokenModel.create({ token });

  await res.clearCookie("token");

  res.status(200).json({
    message: "User logout successfull",
  });
});

module.exports.loggedInUser = catchAsyncErrors(async (req, res, next) => {
  const user = await userModel.findById(req._id);

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

  const users = await userModel.find(keyword).find({ _id: { $ne: req._id } });

  res.status(200).json(users);
});

module.exports.fetchAllUser = catchAsyncErrors(async (req, res, next) => {
  const users = await userModel.find().populate("status");

  res.status(200).json(users);
});

module.exports.editUser = catchAsyncErrors(async (req, res, next) => {
  const { fullName, email, gender } = req.body;

  if (!fullName || !email || !gender) {
    return next(new ErrorHandler("All fields are required !", 400));
  }

  const user = await userModel.findByIdAndUpdate(
    req._id,
    { fullName, email, gender },
    { new: true }
  );

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (req.files && req.files.profileImage) {
    const file = req.files.profileImage;
    const modifiedFileName = uuidv4() + path.extname(file.name);
    const mimeType = file.mimetype?.split("/")[0];

    const validMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];

    if (!validMimeTypes.includes(file.mimetype)) {
      return next(
        new ErrorHandler(
          "Invalid file type. Only JPEG, PNG, JPG and WEBP files are allowed.",
          400
        )
      );
    }

    const maxSize = 2 * 1024 * 1024; // 2MB

    if (file.size > maxSize) {
      return next(
        new ErrorHandler(
          "File size exceeds the 2MB limit, Please select another file !",
          400
        )
      );
    }

    try {
      if (user.profileImage && user.profileImage.fileId) {
        await imagekit.deleteFile(user.profileImage.fileId);
      }

      const { fileId, url } = await imagekit.upload({
        file: file.data,
        fileName: modifiedFileName,
      });

      user.profileImage = { fileId, url, fileType: mimeType };
    } catch (error) {
      return next(new ErrorHandler("File is not uploaded on imagekit !", 500));
    }
  }
  await user.save();

  res.status(200).json(user);
});

module.exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await userModel.findByIdAndDelete(req._id);

  res.status(200).json({ message: "User delete successfully" });
});
