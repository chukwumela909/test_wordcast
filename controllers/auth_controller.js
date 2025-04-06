const User = require('../models/user')
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');


const register = async (req, res) => {
    const { channel_name, password, email } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already in use' });
        }

        const existingChannelName = await User.findOne({ channelName: channel_name });
        if (existingChannelName) {
            return res.status(400).json({ message: 'Channel name is already in use' });
        }

        const user = new User({ userId, channelName : channel_name, password: hashedPassword, email, wallet: 0 });
        await user.save();



        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        // Use bcrypt.compare to safely check the password
        const isValid = await bcrypt.compare(password, user.password);
        
        if (!isValid) return res.status(400).json({ message: 'Invalid credentials' });

        const token = user.userId;

        return res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

const getUser = async (req, res) => {
    const { token } = req.body;
    try {
        const user = await User.findOne({ userId: token });
        if (!user) return res.status(400).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error });
    }
};

module.exports = {
    register,
    login,
    getUser,
};