const jwt = require('jsonwebtoken')

// generate token

const generateToken = (id) => {
    return jwt.sign({id}, "privatekey", {expiresIn: '30d'})
}

module.exports = {generateToken}