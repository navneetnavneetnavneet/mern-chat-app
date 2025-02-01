const {
  catchAsyncErrors,
} = require("../middlewares/catchAsyncErrors.middleware.");
const ErrorHandler = require("../utils/ErrorHandler");
const messageModel = require("../models/message.model");
const userModel = require("../models/user.model");
const chatModel = require("../models/chat.model");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const imagekit = require("../config/imagekit.config").initImageKit();

module.exports.sendMessage = catchAsyncErrors(async (req, res, next) => {
  const { chatId, content, media } = req.body;

  if (!chatId && (!content || !media)) {
    return next(new ErrorHandler("Invalid data passed into request !", 500));
  }

  let fileId, url, mimeType;
  if (req.files && req.files?.media) {
    try {
      const validMimeTypes = [
        // images
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",

        // videos
        "video/mp4",
        "video/webm",
        "video/ogg",

        // text
        "text/plain",
        "application/json",
        "application/pdf",
      ];

      if (!validMimeTypes.includes(req.files?.media?.mimetype)) {
        return next(
          new ErrorHandler(
            "Invalid file type. Please choose another file !",
            500
          )
        );
      }

      const maxSize = 20 * 1024 * 1024; // 20MB

      if (req.files?.media?.size > maxSize) {
        return next(
          new ErrorHandler(
            "File size exceeds the 20MB limit, Please choose another file !",
            500
          )
        );
      }

      const file = req.files?.media;
      const modifiedFileName = uuidv4() + path.extname(file?.name);
      mimeType = file.mimetype?.split("/")[0];

      const fileuploadResponse = await imagekit.upload({
        file: file.data,
        fileName: modifiedFileName,
      });

      fileId = fileuploadResponse.fileId;
      url = fileuploadResponse.url;
    } catch (error) {
      console.log("File Upload Error : ", error);
      return next(new ErrorHandler("File is not uploaded on imagekit !", 500));
    }
  }

  try {
    let message = await messageModel.create({
      content: content,
      senderId: req._id,
      chatId: chatId,
      media: { fileId, url, fileType: mimeType },
    });

    message = await message.populate("senderId");
    message = await message.populate("chatId");
    message = await userModel.populate(message, {
      path: "chatId.users",
    });

    await chatModel.findByIdAndUpdate(
      chatId,
      { latestMessage: message },
      { new: true }
    );

    res.status(201).json(message);
  } catch (error) {
    return next(new ErrorHandler("Message is not created!", 500));
  }
});

module.exports.fetchAllMessages = catchAsyncErrors(async (req, res, next) => {
  const { chatId } = req.params;

  if (!chatId) {
    return next(new ErrorHandler("chatId params not sent by request !", 500));
  }

  const messages = await messageModel
    .find({ chatId: chatId })
    .populate("senderId")
    .populate("chatId");

  res.status(200).json(messages);
});
