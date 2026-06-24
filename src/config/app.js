const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const corsOptions = require('./cors')
const { decryptRequest, encryptResponse } = require('../middleware/encryption.middleware')

const createApp = () => {
    const app = express()

    // Security
    app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))

    // CORS — must come before routes
    app.use(cors(corsOptions)) // handle preflight for all routes

    // Logging
    if (process.env.NODE_ENV !== 'production') {
        app.use(morgan('dev'))
    } else {
        app.use(morgan('combined'))
    }

    // Body parsing
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    // Encryption middleware
    app.use(decryptRequest)
    app.use(encryptResponse)

    return app
}

module.exports = createApp