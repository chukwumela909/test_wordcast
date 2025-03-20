const { Schema, model } = require('mongoose');

const walletSchema = new Schema({
    walletId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    balance: { type: Number, default: 0 },
});

const Wallet = model('Wallet', walletSchema);

module.exports = Wallet;
