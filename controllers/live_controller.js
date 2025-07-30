const Livestream = require('../models/livestream');
const Comment = require('../models/comment');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const crypto = require('crypto');
const User = require('../models/user');

const createLivestream = async (req, res) => {
    console.log("habibah")
    try {
        const liveId = uuidv4();
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }
        
        const hostId = userId; // From auth middleware

        const timeStamp = Math.round(Date.now() / 1000);
        const timeStampInMilliseconds = Date.now();
        const appId = 2105476770;
        const serverSecret = '2001088df8b08f44e880580270eed03e';
        const signatureNonce = crypto.randomBytes(8).toString('hex');

        function GenerateUASignature(appId, signatureNonce, serverSecret, timeStamp) {
            const hash = crypto.createHash('md5'); // Use the MD5 hashing algorithm.
            const str = appId + signatureNonce + serverSecret + timeStamp;
            hash.update(str);
            // hash.digest('hex') indicates that the output is in hex format 
            return hash.digest('hex');
        }

        const signature = GenerateUASignature(appId, signatureNonce, serverSecret, timeStamp);

        const params = {
            Action: 'RTMPDispatchV2',
            StreamId: 'rtc01',
            Sequence: timeStampInMilliseconds.toString(),
            Type: 'pull',
            AppId: '2105476770',
            SignatureNonce: signatureNonce,
            Signature: signature,
            SignatureVersion: '2.0',
            Timestamp: timeStamp.toString()
        };

        const response = await axios.get('https://rtc-api.zego.im/', { params });
        console.log('RTMP Dispatch Response:', response.data);

        const livedata = response.data


        // Check if user already has an active livestream
        const existingLivestream = await Livestream.findOne({ hostId: userId, isActive: true });
        if (existingLivestream) {
            return res.status(409).json({ 
                message: 'You already have an active livestream. Please end your current stream before starting a new one.',
                existingLiveId: existingLivestream.liveId 
            });
        }

        // Create Livestream
        const user = await User.findOne({userId: userId})
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hostChannel = user.channelName
        const channelImage = user.channelImage || '' // Provide default empty string if undefined

        console.log(hostChannel, channelImage)

        const livestream = new Livestream({ liveId, hostId, hostChannel: hostChannel, channelImage: channelImage, viewCount: 0, isActive: true });
        await livestream.save();

     return   res.status(200).json({ message: 'Livestream created', livedata });
    } catch (error) {
        res.status(500).json({ message: 'Error creating livestream', error });
    }
};

const fetchLivestreams = async (req, res) => {
    try {
        const livestreams = await Livestream.find({isActive: true});
        res.json(livestreams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching livestreams', error });
    }
}

const getLivestreams = async (req, res) => {
    try {
        const livestreams = await Livestream.find({ isActive: true });
        if (!livestreams) return res.status(404).json({ message: 'Livestream not found' });
        res.json(livestreams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching livestream', error });
    }
};

const updateLivestream = async (req, res) => {
    const { liveId } = req.params;
    const { viewCount, isActive } = req.body;
    try {
        const livestream = await Livestream.findOne({ liveId });
        if (!livestream) return res.status(404).json({ message: 'Livestream not found' });
        if (livestream.hostId !== req.userId) return res.status(403).json({ message: 'Unauthorized' });

        livestream.viewCount = viewCount ?? livestream.viewCount;
        livestream.isActive = isActive ?? livestream.isActive;
        await livestream.save();
        res.json({ message: 'Livestream updated', livestream });
    } catch (error) {
        res.status(500).json({ message: 'Error updating livestream', error });
    }
};

// Comment Functions
const addComment = async (req, res) => {
    try {
        const { liveId, userId, message } = req.body;
        
        // Validate required fields
        if (!liveId || !userId || !message) {
            return res.status(400).json({ message: 'liveId, userId, and message are required' });
        }

        // Check if livestream exists and is active
        const livestream = await Livestream.findOne({ liveId, isActive: true });
        if (!livestream) {
            return res.status(404).json({ message: 'Active livestream not found' });
        }

        // Get user information
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create comment
        const commentId = uuidv4();
        const comment = new Comment({
            commentId,
            liveId,
            userId,
            username: user.channelName,
            channelImage: user.channelImage || '',
            message: message.trim(),
            timestamp: new Date()
        });

        await comment.save();
        res.status(201).json({ message: 'Comment added successfully', comment });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Error adding comment', error: error.message });
    }
};

const getComments = async (req, res) => {
    try {
        const { liveId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        // Check if livestream exists
        const livestream = await Livestream.findOne({ liveId });
        if (!livestream) {
            return res.status(404).json({ message: 'Livestream not found' });
        }

        // Get comments with pagination
        const comments = await Comment.find({ 
            liveId, 
            isDeleted: false 
        })
        .sort({ timestamp: 1 }) // Most recent last
        .limit(limit * 1)
        .skip((page - 1) * limit);

        const totalComments = await Comment.countDocuments({ liveId, isDeleted: false });

        res.json({
            comments,
            totalComments,
            currentPage: page,
            totalPages: Math.ceil(totalComments / limit)
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Error fetching comments', error: error.message });
    }
};

const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { userId } = req.body; // User requesting deletion

        const comment = await Comment.findOne({ commentId });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if user is the comment owner or livestream host
        const livestream = await Livestream.findOne({ liveId: comment.liveId });
        const isOwner = comment.userId === userId;
        const isHost = livestream && livestream.hostId === userId;

        if (!isOwner && !isHost) {
            return res.status(403).json({ message: 'Unauthorized to delete this comment' });
        }

        // Soft delete the comment
        comment.isDeleted = true;
        await comment.save();

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Error deleting comment', error: error.message });
    }
};

const getRecentComments = async (req, res) => {
    try {
        const { liveId } = req.params;
        const { since } = req.query; // Timestamp to get comments since

        // Check if livestream exists
        const livestream = await Livestream.findOne({ liveId });
        if (!livestream) {
            return res.status(404).json({ message: 'Livestream not found' });
        }

        let query = { liveId, isDeleted: false };
        
        // If since timestamp provided, get comments after that time
        if (since) {
            query.timestamp = { $gt: new Date(since) };
        }

        const comments = await Comment.find(query)
            .sort({ timestamp: 1 }) // Oldest first for real-time updates
            .limit(100); // Limit for performance

        res.json({ comments });
    } catch (error) {
        console.error('Error fetching recent comments:', error);
        res.status(500).json({ message: 'Error fetching recent comments', error: error.message });
    }
};

// Get user's current active livestream
const getUserActiveLivestream = async (req, res) => {
    try {
        const { userId } = req.params;

        const activeLivestream = await Livestream.findOne({ hostId: userId, isActive: true });
        
        if (!activeLivestream) {
            return res.status(404).json({ message: 'No active livestream found for this user' });
        }

        res.json({ livestream: activeLivestream });
    } catch (error) {
        console.error('Error fetching user active livestream:', error);
        res.status(500).json({ message: 'Error fetching user active livestream', error: error.message });
    }
};

// End a livestream (set isActive to false)
const endLivestream = async (req, res) => {
    try {
        const { liveId } = req.params;
        const { userId } = req.body; // User requesting to end the stream

        const livestream = await Livestream.findOne({ liveId });
        if (!livestream) {
            return res.status(404).json({ message: 'Livestream not found' });
        }

        // Check if user is the host
        if (livestream.hostId !== userId) {
            return res.status(403).json({ message: 'Only the host can end this livestream' });
        }

        // Check if already ended
        if (!livestream.isActive) {
            return res.status(400).json({ message: 'Livestream is already ended' });
        }

        // End the livestream
        livestream.isActive = false;
        await livestream.save();

        res.json({ 
            message: 'Livestream ended successfully', 
            livestream: {
                liveId: livestream.liveId,
                hostChannel: livestream.hostChannel,
                isActive: livestream.isActive,
                finalViewCount: livestream.viewCount
            }
        });
    } catch (error) {
        console.error('Error ending livestream:', error);
        res.status(500).json({ message: 'Error ending livestream', error: error.message });
    }
};

module.exports = {
    createLivestream,
    fetchLivestreams,
    getLivestreams,
    updateLivestream,
    addComment,
    getComments,
    deleteComment,
    getRecentComments,
    getUserActiveLivestream,
    endLivestream,
};