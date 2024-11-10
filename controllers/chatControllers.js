const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

module.exports.accessChat = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return next(new ErrorHandler("userId params not sent by request !", 500));
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.senderId",
    select: "name email pic",
  });

  if (isChat.length > 0) {
    res.status(200).json(isChat[0]);
  } else {
    const chatData = {
      isGroupChat: false,
      users: [req.id, userId],
    };

    const createdChat = await Chat.create(chatData);

    if (!createdChat) {
      return next(new ErrorHandler("Chat is not created !", 500));
    }

    const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
      "users"
    );

    res.status(201).json(fullChat);
  }
});
