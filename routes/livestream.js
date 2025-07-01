const express = require('express');
const { 
    createLivestream, 
    getLivestreams, 
    updateLivestream,
    addComment,
    getComments,
    deleteComment,
    getRecentComments 
} = require('../controllers/live_controller');

const router = express.Router();

// Livestream routes
router.post('/create', createLivestream);
router.get('/all-streams', getLivestreams);
router.put('/:liveId', updateLivestream);

// Comment routes
router.post('/comments', addComment); // Add a comment to a livestream
router.get('/:liveId/comments', getComments); // Get comments for a specific livestream with pagination
router.get('/:liveId/comments/recent', getRecentComments); // Get recent comments (for real-time updates)
router.delete('/comments/:commentId', deleteComment); // Delete a comment

module.exports = router;