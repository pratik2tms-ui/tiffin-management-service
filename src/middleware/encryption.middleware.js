// Base64 encode/decode middleware for request/response body
// Controlled by ENCRYPTION_ENABLED in .env — set to 'true' for production-like testing

const isEncryptionEnabled = () => process.env.ENCRYPTION_ENABLED === 'true'

// Decrypt incoming request body: { data: "base64string" } → actual JSON
const decryptRequest = (req, res, next) => {
    if (!isEncryptionEnabled()) return next()

    // No body to decrypt (GET requests etc.)
    if (!req.body || Object.keys(req.body).length === 0) return next()

    if (!req.body.data) {
        return res.status(400).json({
            success: false,
            error: { code: 'ENCRYPTION_REQUIRED', message: 'Request body must be { "data": "<base64>" } when encryption is enabled' },
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

// Encrypt outgoing response body: actual JSON → { data: "base64string" }
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