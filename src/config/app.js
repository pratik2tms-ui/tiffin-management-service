const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const { decryptRequest, encryptResponse } = require('../middleware/encryption.middleware')

const createApp = () => {
    const app = express()

    app.use(helmet())
    app.use(cors())
    app.use(morgan('dev'))
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    // Encryption middleware — applies globally, controlled by ENCRYPTION_ENABLED flag
    app.use(decryptRequest)
    app.use(encryptResponse)

    return app
}

module.exports = createApp