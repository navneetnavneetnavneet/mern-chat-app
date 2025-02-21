const {
  catchAsyncErrors,
} = require("../middlewares/catchAsyncErrors.middleware.");
const ErrorHandler = require("../utils/ErrorHandler");
const chatModel = require("../models/chat.model");
const userModel = require("../models/user.model");
const { validationResult } = require("express-validator");

module.exports.accessChat = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return next(new ErrorHandler("userId params not sent by request !", 400));
  }

  var isChat = await chatModel
    .find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
    .populate("users")
    .populate("latestMessage");

  isChat = await userModel.populate(isChat, {
    path: "latestMessage.senderId",
  });

  if (isChat.length > 0) {
    res.status(200).json(isChat[0]);
  } else {
    try {
      const createdChat = await chatModel.create({
        isGroupChat: false,
        users: [req._id, userId],
      });

      const fullChat = await chatModel
        .findOne({ _id: createdChat._id })
        .populate("users");

      res.status(201).json(fullChat);
    } catch (error) {
      return next(new ErrorHandler("Chat is not created !", 500));
    }
  }
});

module.exports.fetchChats = catchAsyncErrors(async (req, res, next) => {
  const user = await userModel.findById(req._id);

  if (!user) {
    return next(new ErrorHandler("User not found !", 404));
  }

  await chatModel
    .find({ users: { $elemMatch: { $eq: user._id } } })
    .populate("users")
    .populate("groupAdmin")
    .populate("latestMessage")
    .sort({ updatedAt: -1 })
    .then(async (results) => {
      // Adding the admin to the start of the chat.users array
      results.forEach((chat) => {
        if (chat.isGroupChat && chat.groupAdmin) {
          const adminIndex = chat.users.findIndex(
            (u) => u._id.toString() === chat.groupAdmin._id.toString()
          );

          const [adminUser] = chat.users.splice(adminIndex, 1);
          chat.users.unshift(adminUser);
        }

        // Adding the loggedInUser to the start of the chat.users array
        const loggedInUserIndex = chat.users.findIndex(
          (u) => u._id.toString() === user._id.toString()
        );

        const [loggedInUser] = chat.users.splice(loggedInUserIndex, 1);
        chat.users.unshift(loggedInUser);
      });

      results = await userModel.populate(results, {
        path: "latestMessage.senderId",
      });

      res.status(200).json(results);
    });
});

module.exports.createGroupChat = catchAsyncErrors(async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const users = JSON.parse(req.body.users);

  users.push(req._id);

  try {
    const createdGroup = await chatModel.create({
      chatName: req.body.chatName,
      users: users,
      isGroupChat: true,
      groupAdmin: req._id,
    });

    const fullGroupChat = await chatModel
      .findOne({ _id: createdGroup._id })
      .populate("users")
      .populate("groupAdmin");

    res.status(201).json(fullGroupChat);
  } catch (error) {
    return next(new ErrorHandler("Group is not created !", 500));
  }
});

module.exports.renameGroup = catchAsyncErrors(async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { chatId, chatName } = req.body;

  if (!chatId || !chatName) {
    return next(new ErrorHandler("All fields are required !", 500));
  }

  const updatedGroupChat = await chatModel
    .findByIdAndUpdate(chatId, { chatName }, { new: true })
    .populate("users")
    .populate("groupAdmin");

  res.status(200).json(updatedGroupChat);
});

module.exports.addUserToGroup = catchAsyncErrors(async (req, res, next) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    return next(new ErrorHandler("All fields are required !", 500));
  }

  const addUser = await chatModel
    .findByIdAndUpdate(chatId, { $push: { users: userId } }, { new: true })
    .populate("users")
    .populate("groupAdmin");

  res.status(200).json(addUser);
});

module.exports.removeUserFromGroup = catchAsyncErrors(
  async (req, res, next) => {
    const { chatId, userId } = req.body;

    if (!chatId || !userId) {
      return next(new ErrorHandler("All fields are required !", 500));
    }

    const removeUser = await chatModel
      .findByIdAndUpdate(chatId, { $pull: { users: userId } }, { new: true })
      .populate("users")
      .populate("groupAdmin");

    res.status(200).json(removeUser);
  }
);

module.exports.exitUserFromGroup = catchAsyncErrors(async (req, res, next) => {
  const { chatId } = req.body;
  const user = await userModel.findById(req._id);
  const chat = await chatModel
    .findById(chatId)
    .populate("users")
    .populate("groupAdmin");

  if (!chat) {
    return next(new ErrorHandler("Chat in not found !", 404));
  }

  chat.users = chat.users.filter(
    (u) => u._id.toString() !== user._id.toString()
  );

  if (chat.groupAdmin._id.toString() === user._id.toString()) {
    chat.groupAdmin = chat.users[0] || null;
  }

  await chat.save();

  res.status(200).json(chat);
});
