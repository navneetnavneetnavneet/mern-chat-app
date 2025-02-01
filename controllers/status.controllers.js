const {
  catchAsyncErrors,
} = require("../middlewares/catchAsyncErrors.middleware.");
const ErrorHandler = require("../utils/ErrorHandler");
const statusModel = require("../models/status.model");
const userModel = require("../models/user.model");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const imagekit = require("../config/imagekit.config").initImageKit();

module.exports.statusUpload = catchAsyncErrors(async (req, res, next) => {
  const user = await userModel.findById(req._id);

  if (req.files && req.files.media) {
    try {
      const file = req.files.media;
      const modifiedFileName = uuidv4() + path.extname(file?.name);
      const mimeType = file.mimetype?.split("/")[0];

      const validMimeTypes = [
        // Image MIME types
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
        "image/avif",

        // Video MIME types
        "video/mp4",
        "video/x-msvideo",
        "video/mpeg",
        "video/ogg",
        "video/webm",
        "video/3gpp",
      ];

      if (!validMimeTypes.includes(file.mimetype)) {
        return next(
          new ErrorHandler(
            "Invalid file type, Please choose another file !",
            400
          )
        );
      }

      const maxSize = 20 * 1024 * 1024; // 20MB

      if (file.size > maxSize) {
        return next(
          new ErrorHandler(
            "File size exceeds the 20MB limit, Please choose another file !",
            400
          )
        );
      }

      const { fileId, url } = await imagekit.upload({
        file: file.data,
        fileName: modifiedFileName,
      });

      const status = await statusModel.create({
        media: { fileId, url, fileType: mimeType },
        user: user._id,
      });

      user.status.push(status._id);
      await user.save();

      res.status(201).json({
        message: "Status uploaded successfully",
        user,
      });
    } catch (error) {
      return next(new ErrorHandler("File is not uploaded on imagekit !", 500));
    }
  } else {
    return next(
      new ErrorHandler("File is must be required eigther image or video !", 400)
    );
  }
});

module.exports.fetchAllStatus = catchAsyncErrors(async (req, res, next) => {
  const user = await userModel.findById(req._id);

  const allStatus = await statusModel.find().populate({
    path: "user",
    populate: {
      path: "status",
    },
  });

  const obj = {};
  const filteredStatus = allStatus.filter((s) => {
    if (!obj[s.user._id]) {
      return (obj[s.user._id] = "anything");
    }
  });

  const loggedInUserStatus = filteredStatus.find(
    (s) => s.user._id.toString() === user._id.toString()
  );

  const otherUserStatus = filteredStatus.filter(
    (s) => s.user._id.toString() !== user._id.toString()
  );

  if (loggedInUserStatus) {
    otherUserStatus.unshift(loggedInUserStatus);
  }

  res.status(200).json(otherUserStatus);
});

module.exports.deleteStatus = catchAsyncErrors(async (req, res, next) => {
  const user = await userModel.findById(req._id);

  if (!user.status.includes(req.params.id.toString())) {
    return next(new ErrorHandler("Status Not Found !", 404));
  }
  user.status.splice(user.status.indexOf(req.params.id.toString()), 1);
  await statusModel.findByIdAndDelete(req.params.id);
  await user.save();

  res.status(200).json({
    message: "Status deleted successfully",
    user,
  });
});
