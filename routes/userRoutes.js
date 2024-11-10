const express = require("express");
const {
  allUser,
  registerUser,
  loginUser,
} = require("../controllers/userControllers");
const { isAuthenticated } = require("../middlewares/auth");
const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/", isAuthenticated, allUser);

module.exports = router;
