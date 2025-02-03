const multer = require('multer');

const dir = './attachment'; // PATH TO UPLOAD FILE

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: fileStorageEngine });
module.exports = upload;
