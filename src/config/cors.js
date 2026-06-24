const env = process.env.NODE_ENV || 'development'
const config = require('./config.json')[env]

const corsOptions = {
    origin: (origin, callback) => {
        const allowed = getAllowedOrigins()

        // Allow requests with no origin (Postman, mobile apps, curl)
        if (!origin) return callback(null, true)

        if (allowed.includes(origin)) {
            callback(null, true)
        } else {
            console.warn(`CORS blocked origin: ${origin}`)
            callback(new Error(`CORS blocked: ${origin} is not allowed`))
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}

const getAllowedOrigins = () => {
    const base = [config.frontendUrl].filter(Boolean)

    // In development also allow common Vite ports as fallback
    if (env === 'development') {
        return [
            ...base,
            'http://localhost:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:5174',
        ]
    }

    return base
}

module.exports = corsOptions