const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadFolderPath = path.join(__dirname, "../public/images/uploads");
    cb(null, uploadFolderPath);
  },
  filename: (req, file, cb) => {
    const uniqueFileName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueFileName);
  },
});

const upload = multer({ storage });

module.exports = upload;
