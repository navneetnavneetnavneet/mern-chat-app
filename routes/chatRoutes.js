const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares/auth");
const { accessChat } = require("../controllers/chatControllers");

router.post("/", isAuthenticated, accessChat);

module.exports = router;
