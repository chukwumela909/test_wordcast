const express = require('express');
const { createLivestream, getLivestream, updateLivestream } = require('../controllers/live_controller');
const { protect } = require('../middlewares/authmiddleware');

const router = express.Router();

router.post('/', protect, createLivestream);
router.get('/:liveId', getLivestream);
router.put('/:liveId', protect, updateLivestream);

module.exports = router;