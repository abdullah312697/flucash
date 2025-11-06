import multer from 'multer';

const storage = multer.memoryStorage();

const multerMiddleware = multer({
  storage: storage,
  // Limiting file size to 100MB (adjust as needed)
  limits: { fileSize: 100 * 1024 * 1024 },
  // Accepting only mp4, avi, mov, mkv files
  fileFilter: (req, file, cb) => {
    const fileRegex = /\.(mp4|avi|mov|mkv)$/;
    const fileName = file.originalname.toLowerCase();

    if (!fileName.match(fileRegex)) {
      // Throw exception
      return cb(new Error('Invalid file type'));
    }
    // Pass the file
    cb(null, true);
  }
});

const multerVideoProcess = multerMiddleware.single('file'); // Adjust the field name as per your form-data key
// const multerProcess = multerMiddleware.array('videos', 10); // For multiple video uploads

export default multerVideoProcess;
