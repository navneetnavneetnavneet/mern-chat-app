const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares/auth");
const { accessChat, fetchChats } = require("../controllers/chatControllers");

// POST /api/chats
router.post("/", isAuthenticated, accessChat);

// GET /api/chats
router.get("/", isAuthenticated, fetchChats);

module.exports = router;
