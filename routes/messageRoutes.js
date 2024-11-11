const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares/auth");
const {
  sendMessage,
  allMessage,
} = require("../controllers/messageControllers");

router.post("/send-message", isAuthenticated, sendMessage);


module.exports = router;
