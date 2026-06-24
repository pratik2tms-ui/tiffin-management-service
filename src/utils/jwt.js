const env = process.env.NODE_ENV || 'development'
const config = require('../config/config.json')[env]
const jwt = require('jsonwebtoken')

const generateToken = (payload) =>
    jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN || '7d' })

const verifyToken = (token) =>
    jwt.verify(token, config.JWT_SECRET)

module.exports = { generateToken, verifyToken }