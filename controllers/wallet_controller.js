const { Wallet } = require('../models/wallet');

const getWallet = async (req, res) => {
    const { userId } = req.params;
    try {
        const wallet = await Wallet.findOne({ userId });
        if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
        res.json(wallet);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wallet', error });
    }
};

module.exports = { getWallet };