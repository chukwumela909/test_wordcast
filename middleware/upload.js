    const multer = require('multer');
    const cloudinary = require('cloudinary').v2;
    const { CloudinaryStorage } = require('multer-storage-cloudinary');
    const path = require('path');
    const fs = require('fs');

    // Configure Cloudinary
    cloudinary.config({
        cloud_name: "daf6mdwkh",
        api_key: '336955753785989',
        api_secret: 'Vfdz57A-u5IfWQN_iLdGuriWHu4'
    });

    // Set up Multer storage engine for Cloudinary
    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
        folder: 'my-uploads', // optional folder in your Cloudinary account
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'], // allowed file formats
        transformation: [{ width: 500, height: 500, crop: 'limit' }] // optional transformations
        }
    });

    // File filter (optional: accept only images)
    const fileFilter = (req, file, cb) => {
        console.log("Multer received file:", { // Log the received file info
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype, // THIS IS THE KEY VALUE TO CHECK
            size: file.size
        });

        // Add a check to see if mimetype exists at all
        if (file.mimetype && file.mimetype.startsWith('image/')) {
            cb(null, true); // Accept file
        } else {
            console.error(`File rejected. Expected mimetype starting with 'image/', but received '${file.mimetype}'.`);
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