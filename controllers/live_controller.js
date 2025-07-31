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
        const { userId, streamType = 'rtmp' } = req.body; // Add streamType with default 'rtmp'
        
        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        // Validate streamType
        const validStreamTypes = ['rtmp', 'normal', 'webrtc'];
        if (!validStreamTypes.includes(streamType)) {
            return res.status(400).json({ message: 'Invalid stream type. Must be rtmp, normal, or webrtc' });
        }
        
        const hostId = userId;
        let livedata = null;

        // Only generate RTMP data for RTMP streams
        if (streamType === 'rtmp') {
            const timeStamp = Math.round(Date.now() / 1000);
            const timeStampInMilliseconds = Date.now();
            const appId = 1309704904;
            const serverSecret = '68a531a8e5b1cd9a19624d2f3f075952';
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
                AppId: '1309704904',
                SignatureNonce: signatureNonce,
                Signature: signature,
                SignatureVersion: '2.0',
                Timestamp: timeStamp.toString()
            };

            const response = await axios.get('https://rtc-api.zego.im/', { params });
            console.log('RTMP Dispatch Response:', response.data);
            livedata = response.data;
        }


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

        const livestream = new Livestream({ 
            liveId, 
            hostId, 
            hostChannel: hostChannel, 
            channelImage: channelImage, 
            viewCount: 0, 
            isActive: true,
            streamType: streamType // Add streamType to the database record
        });
        await livestream.save();

        const response_data = {
            message: 'Livestream created',
            streamType: streamType,
            liveId: liveId
        };

        // Only include livedata for RTMP streams
        if (streamType === 'rtmp' && livedata) {
            response_data.livedata = livedata;
        }

        return res.status(200).json(response_data);
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

// Join a livestream (increment view count)
const joinLivestream = async (req, res) => {
    try {
        const { liveId } = req.params;
        const { userId } = req.body; // Optional: track which users joined

        const livestream = await Livestream.findOne({ liveId, isActive: true });
        if (!livestream) {
            return res.status(404).json({ message: 'Active livestream not found' });
        }

        // Initialize viewers array if it doesn't exist
        if (!livestream.viewers) {
            livestream.viewers = [];
        }

        // Check if user hasn't already been counted
        if (userId && !livestream.viewers.includes(userId)) {
            livestream.viewers.push(userId);
            livestream.viewCount = livestream.viewers.length;
        } else if (!userId) {
            // For anonymous viewers, just increment
            livestream.viewCount += 1;
        }

        await livestream.save();

        res.json({ 
            message: 'Joined livestream successfully', 
            currentViewCount: livestream.viewCount,
            livestream: {
                liveId: livestream.liveId,
                hostChannel: livestream.hostChannel,
                channelImage: livestream.channelImage,
                viewCount: livestream.viewCount
            }
        });
    } catch (error) {
        console.error('Error joining livestream:', error);
        res.status(500).json({ message: 'Error joining livestream', error: error.message });
    }
};

// Leave a livestream (decrement view count)
const leaveLivestream = async (req, res) => {
    try {
        const { liveId } = req.params;
        const { userId } = req.body;

        const livestream = await Livestream.findOne({ liveId, isActive: true });
        if (!livestream) {
            return res.status(404).json({ message: 'Active livestream not found' });
        }

        // Remove user from viewers if they're leaving
        if (userId && livestream.viewers && livestream.viewers.includes(userId)) {
            livestream.viewers = livestream.viewers.filter(viewer => viewer !== userId);
            livestream.viewCount = Math.max(0, livestream.viewCount - 1);
            await livestream.save();
        }

        res.json({ 
            message: 'Left livestream successfully', 
            currentViewCount: livestream.viewCount 
        });
    } catch (error) {
        console.error('Error leaving livestream:', error);
        res.status(500).json({ message: 'Error leaving livestream', error: error.message });
    }
};

// Fetch livestreams by specific type
const fetchLivestreamsByType = async (req, res) => {
    try {
        const { streamType } = req.params;
        
        // Validate streamType
        const validStreamTypes = ['rtmp', 'normal', 'webrtc'];
        if (!validStreamTypes.includes(streamType)) {
            return res.status(400).json({ message: 'Invalid stream type. Must be rtmp, normal, or webrtc' });
        }

        const livestreams = await Livestream.find({ 
            isActive: true, 
            streamType: streamType 
        });
        
        res.json({
            streamType: streamType,
            count: livestreams.length,
            livestreams: livestreams
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching livestreams by type', error });
    }
};

// Fetch all livestreams grouped by type
const fetchAllLivestreamsGrouped = async (req, res) => {
    try {
        const rtmpStreams = await Livestream.find({ 
            isActive: true, 
            streamType: 'rtmp' 
        });
        
        const normalStreams = await Livestream.find({ 
            isActive: true, 
            streamType: 'normal' 
        });

        const webrtcStreams = await Livestream.find({ 
            isActive: true, 
            streamType: 'webrtc' 
        });

        res.json({
            rtmp: {
                count: rtmpStreams.length,
                streams: rtmpStreams
            },
            normal: {
                count: normalStreams.length,
                streams: normalStreams
            },
            webrtc: {
                count: webrtcStreams.length,
                streams: webrtcStreams
            },
            total: rtmpStreams.length + normalStreams.length + webrtcStreams.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching grouped livestreams', error });
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
    joinLivestream,
    leaveLivestream,
    fetchLivestreamsByType,
    fetchAllLivestreamsGrouped,
};