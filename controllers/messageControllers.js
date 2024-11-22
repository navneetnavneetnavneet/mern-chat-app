const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const imagekit = require("../utils/ImageKit").initImageKit();

module.exports.sendMessage = catchAsyncErrors(async (req, res, next) => {
  const { chatId, content, media } = req.body;

  if (!chatId && (!content || !media)) {
    return next(new ErrorHandler("Invalid data passed into request !", 500));
  }

  let fileId, url, mimeType;
  if (req.files && req.files?.media) {
    try {
      const imageMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
      ];

      const videoMimeTypes = ["video/mp4", "video/webm", "video/ogg"];

      const textMimeTypes = [
        "text/plain",
        "application/json",
        "application/pdf",
        "text/html",
        "text/javascript",
        "text/css",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      const validMimeTypes = [
        ...imageMimeTypes,
        ...videoMimeTypes,
        ...textMimeTypes,
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
            "File size exceeds the 10MB limit, Please choose another file !",
            500
          )
        );
      }

      mimeType = req?.files?.media?.mimetype?.split("/")[0];
      const file = req.files?.media;
      const modifiedFileName = uuidv4() + path.extname(file?.name);

      const fileuploadResponse = await imagekit.upload({
        file: file.data,
        fileName: modifiedFileName,
      });

      console.log(fileuploadResponse);
      

      fileId = fileuploadResponse.fileId;
      url = fileuploadResponse.url;
    } catch (error) {
      console.log(error);

      return next(new ErrorHandler("File upload failed !", 500));
    }
  }

  let message = await Message.create({
    content: content,
    senderId: req.id,
    chatId: chatId,
    media: { fileId, url, fileType: mimeType },
  });

  if (!message) {
    return next(new ErrorHandler("Message is not created !", 500));
  }

  message = await message.populate(
    "senderId",
    "fullName email profileImage gender"
  );
  message = await message.populate("chatId");
  message = await User.populate(message, {
    path: "chatId.users",
    select: "fullName email profileImage gender",
  });

  await Chat.findByIdAndUpdate(
    chatId,
    { latestMessage: message },
    { new: true }
  );

  res.status(201).json(message);
});

module.exports.fetchAllMessages = catchAsyncErrors(async (req, res, next) => {
  const { chatId } = req.params;

  if (!chatId) {
    return next(new ErrorHandler("chatId params not sent by request !", 500));
  }

  const messages = await Message.find({ chatId: chatId })
    .populate("senderId", "fullName email profileImage gender")
    .populate("chatId");

  res.status(200).json(messages);
});
