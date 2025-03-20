const express = require('express');
const { register, login, getUser } = require('../controllers/user_controller');
const { protect } = require('../middlewares/authmiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/:id', protect, getUser);

module.exports = router;