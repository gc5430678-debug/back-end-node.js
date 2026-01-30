const multer = require("multer");

const storage = multer.memoryStorage();
const uploadhome = multer({ storage });

module.exports = uploadhome;
