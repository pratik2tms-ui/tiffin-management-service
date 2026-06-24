const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const corsOptions = require('./cors')
const { decryptRequest, encryptResponse } = require('../middleware/encryption.middleware')

const createApp = () => {
    const app = express()

    app.use(helmet())
    app.use(cors(corsOptions))   // handles both preflight + actual requests
    app.use(morgan('dev'))
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    app.use(decryptRequest)
    app.use(encryptResponse)

    return app
}

module.exports = createApp