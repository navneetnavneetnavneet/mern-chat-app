const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares/auth");
const { statusUpload } = require("../controllers/statusControllers");

router.post("/upload", isAuthenticated, statusUpload);

module.exports = router;
