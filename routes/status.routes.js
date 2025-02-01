const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const statusController = require("../controllers/status.controllers");

// POST /api/status/upload
router.post(
  "/upload",
  authMiddleware.isAuthenticated,
  statusController.statusUpload
);

// POST /api/status/
router.get(
  "/",
  authMiddleware.isAuthenticated,
  statusController.fetchAllStatus
);

// POST /api/status/delete/:statusId
router.get(
  "/delete/:id",
  authMiddleware.isAuthenticated,
  statusController.deleteStatus
);

module.exports = router;
