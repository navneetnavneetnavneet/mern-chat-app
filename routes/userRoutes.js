const express = require("express");
const { homePage, registerUser } = require("../controllers/userRoutes");
const router = express.Router();

router.get("/", homePage);

router.post("/register", registerUser);

module.exports = router;
