const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define the storage location and filename strategy
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '..', 'uploads', 'channel_images'); // Store in project_root/uploads/channel_images
        // Create the directory if it doesn't exist
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath); // Specify the directory to save files
    },
    filename: function (req, file, cb) {
        // Create a unique filename: fieldname-timestamp.extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter (optional: accept only images)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // Accept file
    } else {
        cb(new Error('Only image files are allowed!'), false); // Reject file
    }
};

// Configure Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // Limit file size to 5MB (optional)
    }
});

module.exports = upload;