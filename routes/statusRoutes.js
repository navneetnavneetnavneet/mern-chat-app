const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares/auth");
const { statusUpload, fetchAllStatus } = require("../controllers/statusControllers");

router.post("/upload", isAuthenticated, statusUpload);

router.get("/", isAuthenticated, fetchAllStatus);

module.exports = router;
