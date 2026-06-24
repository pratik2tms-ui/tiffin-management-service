const env = process.env.NODE_ENV || 'development'
const config = require('./config.json')[env]

const getAllowedOrigins = () => {
    const base = [config.frontendUrl].filter(Boolean)

    if (env === 'development') {
        return [
            ...base,
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:4173',
            'http://127.0.0.1:5173',
        ]
    }

    if (env === 'test') {
        return [
            ...base,
            'http://localhost:5173',
            'https://tiffin-management-system-alpha.vercel.app',
        ]
    }

    return base
}

const corsOptions = {
    origin: (origin, callback) => {
        const allowed = getAllowedOrigins()

        // Allow Postman, curl, mobile apps
        if (!origin) {
            return callback(null, true)
        }

        const isVercelPreview =
            /^https:\/\/tiffin-management-system.*\.vercel\.app$/.test(origin)

        if (allowed.includes(origin) || isVercelPreview) {
            return callback(null, true)
        }

        console.warn(`🚫 CORS blocked: ${origin}`)
        console.warn(`✅ Allowed origins: ${allowed.join(', ')}`)
        return callback(new Error(`CORS blocked: ${origin} is not allowed`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}

module.exports = corsOptions