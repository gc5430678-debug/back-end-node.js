const multer = require("multer");
const storage = multer.memoryStorage();
const uploddjaj = multer({ storage });

module.exports = uploddjaj;
