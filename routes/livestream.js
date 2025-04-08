const express = require('express');
const { createLivestream, getLivestream, updateLivestream } = require('../controllers/live_controller');


const router = express.Router();

router.post('/create', createLivestream);
router.post('/all-streams', createLivestream);
router.get('/:liveId', getLivestream);
router.put('/:liveId', updateLivestream);

module.exports = router;