import multer from "multer";

const storage = multer.memoryStorage();

const multerMiddleware = multer({
    storage: storage,
    // Limiting file size to 10MB
    limits: { fileSize: 10 * 1024 * 1024 },
    // Accepting only jpg, jpeg, png files
    fileFilter: (req, file, cb) => {
        const fileRegex = /\.(jpg|jpeg|png)$/;
        const fileName = file.originalname;

        if (!fileName.match(fileRegex)) {
            // Throw exception
            return cb(new Error('Invalid file type'));
        }
        // Pass the file
        cb(null, true);
    }
});

const multerProcess = multerMiddleware.single('file'); // Single for accepting only one file from image form-data key
// const multerProcess = multerMiddleware.array('files', 10);
export default multerProcess;
