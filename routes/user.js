const express = require('express');
const { uploadChannelImage } = require('../controllers/user_controller');
const upload = require('../middleware/upload');

const router = express.Router();

router.post(
    '/upload-channel-image',
    upload.single('channelImage'), // Use multer middleware here
    uploadChannelImage           // Then call the controller function
);



module.exports = router;