const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares/auth");
const {
  sendMessage,
  allMessage,
  fetchAllMessages,
} = require("../controllers/messageControllers");

router.post("/send-message", isAuthenticated, sendMessage);

router.get("/:chatId", isAuthenticated, fetchAllMessages);


module.exports = router;
