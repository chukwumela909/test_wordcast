const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true, },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
});

const User = model('User', userSchema);

module.exports = User;