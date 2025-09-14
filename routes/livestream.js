const express = require('express');
const { 
    createLivestream, 
    getLivestreams, 
    getLivestreamById,
    updateLivestream,
    addComment,
    getComments,
    deleteComment,
    getRecentComments,
    getUserActiveLivestream,
    endLivestream,
    joinLivestream,
    leaveLivestream,
    fetchLivestreamsByType,
    fetchAllLivestreamsGrouped
} = require('../controllers/live_controller');

const router = express.Router();

// Livestream routes
router.post('/create', createLivestream);
router.get('/all-streams', getLivestreams);
router.get('/:liveId', getLivestreamById);
router.get('/type/:streamType', fetchLivestreamsByType); // Get livestreams by specific type
router.get('/grouped', fetchAllLivestreamsGrouped); // Get all livestreams grouped by type
router.put('/:liveId', updateLivestream);
router.get('/user/:userId/active', getUserActiveLivestream); // Get user's current active livestream
router.post('/:liveId/end', endLivestream); // End a livestream
router.post('/:liveId/join', joinLivestream); // Join a livestream (increment view count)
router.post('/:liveId/leave', leaveLivestream); // Leave a livestream (decrement view count)

// Comment routes
router.post('/comments', addComment); // Add a comment to a livestream
router.get('/:liveId/comments', getComments); // Get comments for a specific livestream with pagination
router.get('/:liveId/comments/recent', getRecentComments); // Get recent comments (for real-time updates)
router.delete('/comments/:commentId', deleteComment); // Delete a comment

module.exports = router;