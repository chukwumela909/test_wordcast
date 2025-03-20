const jwt = require('jsonwebtoken')

// generate token

const generateToken = (id) => {
    console.log('i am working');
    return jwt.sign({id}, "privatekey", {expiresIn: '30d'})
}

module.exports = {generateToken}