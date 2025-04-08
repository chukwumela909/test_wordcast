const User = require('../models/user')
const path = require('path'); // Needed for path manipulation



const uploadChannelImage = async (req, res) => {
    try {
        // 1. Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded.' });
        }

        // 2. Get userId from the request body (sent as a field)
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        // 3. Find the user in the database
        const user = await User.findOne({ userId: userId });
        if (!user) {
            // Note: Depending on your app logic, you might want to handle this differently
            // Maybe create the user if they don't exist, or just return an error.
            return res.status(404).json({ message: 'User not found.' });
        }

        // 4. Construct the file path to be saved in the DB
        // This path should be relative to how you serve static files,
        // or a full URL if stored elsewhere (like a CDN).
        // Assuming you serve 'uploads' directory statically at '/uploads' route:
        const relativeFilePath = `/uploads/channel_images/${req.file.filename}`;

        // 5. Update the user's channelImage field
        user.channelImage = relativeFilePath;
        await user.save(); // Save the updated user document

        // 6. Send success response
        console.log(`Channel image updated for user ${userId} to ${relativeFilePath}`);
        res.status(200).json({
            message: 'Channel image uploaded successfully!',
            filePath: relativeFilePath // Send the path back to the client
        });

    } catch (error) {
        console.error('Error uploading channel image:', error);
        // Handle specific errors like file size limit exceeded from multer
        if (error instanceof multer.MulterError) {
             if (error.code === 'LIMIT_FILE_SIZE') {
                 return res.status(400).json({ message: 'File is too large. Max size is 5MB.' });
             }
             // Handle other multer errors if needed
        } else if (error.message === 'Only image files are allowed!') { // Error from our fileFilter
            return res.status(400).json({ message: error.message });
        }
        // General server error
        res.status(500).json({ message: 'Server error during image upload.' });
    }
};



module.exports = {
    uploadChannelImage
};