const express = require("express");
const {
  registerUser,
  loginUser,
  currentUser,
  allUser,
  editUser,
  deleteUser,
} = require("../controllers/userControllers");
const { isAuthenticated } = require("../middlewares/auth");
const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/current", isAuthenticated, currentUser);

router.get("/", isAuthenticated, allUser);

router.post("/edit", isAuthenticated, editUser);

router.get("/delete", isAuthenticated, deleteUser);

module.exports = router;
