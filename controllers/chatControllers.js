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

module.exports.fetchChats = catchAsyncErrors(async (req, res, next) => {
  await Chat.find({ users: { $elemMatch: { $eq: req.id } } })
    .populate("users")
    .populate("groupAdmin")
    .populate("latestMessage")
    .sort({ updatedAt: -1 })
    .then(async (results) => {
      results = await User.populate(results, {
        path: "latestMessage.senderId",
        select: "name email pic",
      });

      res.status(200).json(results);
    });
});

module.exports.createGroupChat = catchAsyncErrors(async (req, res, next) => {
  if (!req.body.chatName || !req.body.users) {
    return next(new ErrorHandler("Please fill all the fields !", 500));
  }

  const users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return next(
      new ErrorHandler("More than two users are required in group chat !", 500)
    );
  }

  users.push(req.id);

  const chatNameAlreadyExists = await Chat.findOne({
    chatName: req.body.chatName,
  });

  const createdGroup = await Chat.create({
    chatName: req.body.chatName,
    users: users,
    isGroupChat: true,
    groupAdmin: req.id,
  });

  if (!createdGroup) {
    return next(new ErrorHandler("Group Chat is not created !", 500));
  }

  const fullGroupChat = await Chat.findOne({ _id: createdGroup._id })
    .populate("users")
    .populate("groupAdmin");

  res.status(201).json(fullGroupChat);
});
