const { Schema, model } = require('mongoose');

const commentSchema = new Schema({
    commentId: { type: String, required: true, unique: true },
    liveId: { type: String, required: true }, // Links to the livestream
    userId: { type: String, required: true },
    username: { type: String, required: true },
    channelImage: { type: String, default: '' },
    message: { type: String, required: true, maxlength: 500 },
    timestamp: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false } // For soft delete/moderation
});

// Index for efficient querying
commentSchema.index({ liveId: 1, timestamp: -1 });

const Comment = model('Comment', commentSchema);

module.exports = Comment; 