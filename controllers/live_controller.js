const Livestream = require('../models/livestream');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const crypto = require('crypto');
const User = require('../models/user');

const createLivestream = async (req, res) => {
    try {
        const liveId = uuidv4();
        const { userId } = req.body;
        const hostId = userId; // From auth middleware

        const activeLivestream = await Livestream.findOne({ hostId: userId, isActive: true });
        if (activeLivestream) return res.status(404).json({ message: 'You alreadt have an active livestream' });
        // Create Livestream
        const user = await User.findOne({ userId: userId })

        const hostChannel = user.channelName
        const channelImage = user.channelImage

        const timeStamp = Math.round(Date.now() / 1000);
        const timeStampInMilliseconds = Date.now();
        const appId = 486156498;
        const serverSecret = 'b849b631636b018288a3712a2a51c4f3';
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
            StreamId: channelImage,
            Sequence: timeStampInMilliseconds.toString(),
            Type: 'pull',
            AppId: '486156498',
            SignatureNonce: signatureNonce,
            Signature: signature,
            SignatureVersion: '2.0',
            Timestamp: timeStamp.toString()
        };

        const response = await axios.get('https://rtc-api.zego.im/', { params });
        console.log('RTMP Dispatch Response:', response.data);

        const livedata = response.data

        console.log(hostChannel, channelImage)

        const livestream = new Livestream({ liveId, hostId, hostChannel: hostChannel, channelImage: channelImage, viewCount: 0, isActive: true });
        await livestream.save();

        return res.status(200).json({ message: 'Livestream created', livedata });
    } catch (error) {
        res.status(500).json({ message: 'Error creating livestream', error });
    }
};

const fetchLivestreams = async (req, res) => {
    try {
        const livestreams = await Livestream.find({ isActive: true });

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

module.exports = {
    createLivestream,
    fetchLivestreams,
    getLivestreams,
    updateLivestream,
};