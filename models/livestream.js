const { Schema, model } = require('mongoose');

const livestreamSchema = new Schema({
    liveId: { type: String, required: true, unique: true },
    hostId: { type: String, required: true },
    viewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    streamID: { type: String, required: true }, // New field added
});

const Livestream = model('Livestream', livestreamSchema);

module.exports = { Livestream };
