const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares/auth");
const { statusUpload, fetchAllStatus, deleteStatus } = require("../controllers/statusControllers");

router.post("/upload", isAuthenticated, statusUpload);

router.get("/", isAuthenticated, fetchAllStatus);

router.get("/delete/:id", isAuthenticated, deleteStatus);

module.exports = router;
