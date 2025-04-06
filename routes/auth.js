const express = require('express');
const { register, login, getUser } = require('../controllers/auth_controller');


const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/user', getUser);

module.exports = router;