const env = process.env.NODE_ENV || 'development'
const config = require('../config/config.json')[env]

const isEncryptionEnabled = () => config.encryptionEnabled === true

const decryptRequest = (req, res, next) => {
    if (!isEncryptionEnabled()) return next()
    if (!req.body || Object.keys(req.body).length === 0) return next()

    if (!req.body.data) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'ENCRYPTION_REQUIRED',
                message: 'Request body must be { "data": "<base64>" } when encryption is enabled',
            },
        })
    }

    try {
        const decoded = Buffer.from(req.body.data, 'base64').toString('utf-8')
        req.body = JSON.parse(decoded)
        next()
    } catch (err) {
        return res.status(400).json({
            success: false,
            error: { code: 'DECRYPTION_FAILED', message: 'Could not decode request body' },
        })
    }
}

const encryptResponse = (req, res, next) => {
    if (!isEncryptionEnabled()) return next()

    const originalJson = res.json.bind(res)

    res.json = (body) => {
        const encoded = Buffer.from(JSON.stringify(body), 'utf-8').toString('base64')
        return originalJson({ data: encoded })
    }

    next()
}

module.exports = { decryptRequest, encryptResponse, isEncryptionEnabled }