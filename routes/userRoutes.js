const express = require("express");
const {
  signUpUser,
  signInUser,
  signOutUser,
  loggedInUser,
  allUser,
  editUser,
  deleteUser,
} = require("../controllers/userControllers");
const { isAuthenticated } = require("../middlewares/auth");
const router = express.Router();

router.post("/signup", signUpUser);

router.post("/signin", signInUser);

router.get("/signout", isAuthenticated, signOutUser);

router.get("/current", isAuthenticated, loggedInUser);

router.get("/alluser", isAuthenticated, allUser);

router.post("/edit", isAuthenticated, editUser);

router.get("/delete", isAuthenticated, deleteUser);

module.exports = router;
