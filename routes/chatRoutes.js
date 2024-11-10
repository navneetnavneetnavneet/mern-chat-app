const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares/auth");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
} = require("../controllers/chatControllers");

// POST /api/chats
router.post("/", isAuthenticated, accessChat);

// GET /api/chats
router.get("/", isAuthenticated, fetchChats);

// POST /api/chats/create-group
router.post("/create-group", isAuthenticated, createGroupChat);

// POST /api/chats/rename-group
router.post("/rename-group", isAuthenticated, renameGroup);

module.exports = router;
