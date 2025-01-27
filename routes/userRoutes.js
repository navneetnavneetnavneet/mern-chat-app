const express = require("express");
const {
  signUpUser,
  signInUser,
  signOutUser,
  loggedInUser,
  allUser,
  editUser,
  deleteUser,
  fetchAllUser,
  sendOTP,
} = require("../controllers/userControllers");
const { isAuthenticated } = require("../middlewares/auth");
const router = express.Router();

router.post("/send-otp", sendOTP);

router.post("/signup", signUpUser);

router.post("/signin", signInUser);

router.get("/signout", isAuthenticated, signOutUser);

router.get("/current", isAuthenticated, loggedInUser);

router.get("/alluser", isAuthenticated, allUser);

// include loggedInUser
router.get("/", isAuthenticated, fetchAllUser);

router.post("/edit", isAuthenticated, editUser);

router.get("/delete", isAuthenticated, deleteUser);

module.exports = router;
