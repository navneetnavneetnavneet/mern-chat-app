const express = require("express");
const { homePage, registerUser, loginUser } = require("../controllers/userControllers");
const router = express.Router();

router.get("/", homePage);

router.post("/register", registerUser);

router.post("/login", loginUser);

module.exports = router;
