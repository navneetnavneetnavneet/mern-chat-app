const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

module.exports.sendMessage = catchAsyncErrors(async (req, res, next) => {
  const { chatId, content } = req.body;

  if (!chatId || !content) {
    return next(new ErrorHandler("Invalid data passed into request !", 500));
  }

  let message = await Message.create({
    content: content,
    senderId: req.id,
    chatId: chatId,
  });

  if (!message) {
    return next(new ErrorHandler("Message is not created !", 500));
  }

  message = await message.populate("senderId", "name email pic");
  message = await message.populate("chatId");
  message = await User.populate(message, {
    path: "chatId.users",
    select: "name email pic",
  });

  await Chat.findByIdAndUpdate(
    chatId,
    { latestMessage: message },
    { new: true }
  );

  res.status(201).json(message);
});
