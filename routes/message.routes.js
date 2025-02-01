const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const messageController = require("../controllers/message.controllers");

// POST /api/messages/send-message
router.post(
  "/send-message",
  authMiddleware.isAuthenticated,
  messageController.sendMessage
);

// POST /api/messages/:chatId
router.get(
  "/:chatId",
  authMiddleware.isAuthenticated,
  messageController.fetchAllMessages
);

module.exports = router;
