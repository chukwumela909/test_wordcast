const express = require('express');
const { createLivestream, getLivestreams, updateLivestream } = require('../controllers/live_controller');


const router = express.Router();

router.post('/create', createLivestream);
router.get('/all-streams', getLivestreams); // Fetch all livestreams
router.put('/:liveId', updateLivestream);

module.exports = router;