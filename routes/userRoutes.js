const express = require("express");
const { homePage, registerUser } = require("../controllers/userControllers");
const router = express.Router();

router.get("/", homePage);

router.post("/register", registerUser);

module.exports = router;
