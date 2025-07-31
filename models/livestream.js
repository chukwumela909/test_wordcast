const { Schema, model } = require('mongoose');

const livestreamSchema = new Schema({
    liveId: { type: String, required: true, unique: true },
    hostId: { type: String, required: true },
    hostChannel: { type: String, required: true },
    channelImage: { type: String, default: 'https://res.cloudinary.com/daf6mdwkh/image/upload/v1751326132/tgn_ahitjm.png' },
    viewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: false },// New field added
     streamType: { 
        type: String, 
        enum: ['rtmp', 'normal'], 
        default: 'rtmp' 
    },
    roomid: { type: String, },
});

const Livestream = model('Livestream', livestreamSchema);

module.exports = Livestream;
