const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const chatController = require("../controllers/chat.controllers");
const { body } = require("express-validator");

// POST /api/chats
router.post(
  "/",
  authMiddleware.isAuthenticated,
  chatController.accessChat
);

// GET /api/chats
router.get("/", authMiddleware.isAuthenticated, chatController.fetchChats);

// POST /api/chats/create-group
router.post(
  "/create-group",
  [
    body("chatName")
      .isLength()
      .withMessage("chatName must be atleast 1 characters "),
    body("users")
      .isLength({ min: 2 })
      .withMessage("More than 2 users are required in group chat !"),
  ],
  authMiddleware.isAuthenticated,
  chatController.createGroupChat
);

// POST /api/chats/rename-group
router.post(
  "/rename-group",
  [
    body("chatName")
      .isLength()
      .withMessage("chatName must be atleast 1 characters "),
  ],
  authMiddleware.isAuthenticated,
  chatController.renameGroup
);

// POST /api/chats/add-user-group
router.post(
  "/add-user-group",
  authMiddleware.isAuthenticated,
  chatController.addUserToGroup
);

// POST /api/chats/remove-user-group
router.post(
  "/remove-user-group",
  authMiddleware.isAuthenticated,
  chatController.removeUserFromGroup
);

// POST /api/chats/exit-user-group
router.post(
  "/exit-user-group",
  authMiddleware.isAuthenticated,
  chatController.exitUserFromGroup
);

module.exports = router;
