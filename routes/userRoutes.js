const express = require("express");
const { homePage } = require("../controllers/userRoutes");
const router = express.Router();

router.get("/", homePage);

module.exports = router;
