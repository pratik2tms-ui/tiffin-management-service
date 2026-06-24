require('dotenv').config()
const createApp = require('./src/config/app')
const db = require('./src/models')
const routes = require('./src/routes')

const env = process.env.NODE_ENV || 'development'
const config = require('./src/config/config.json')[env]

const app = createApp()
const PORT = process.env.PORT || 5000

// Routes
app.use('/api', routes)

// 404 handler — after all routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Route not found' },
    })
})

// Global error handler — must be last, needs all 4 args
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(err.status || 500).json({
        success: false,
        error: {
            code: err.code || 'INTERNAL_ERROR',
            message: process.env.NODE_ENV === 'production'
                ? 'Internal Server Error'
                : err.message,
        },
    })
})

const startServer = async () => {
    try {
        await db.sequelize.authenticate()
        console.log('✅ Database connected successfully')
        console.log(`📦 Environment  : ${env}`)
        console.log(`🔐 Encryption   : ${config.encryptionEnabled ? 'ENABLED' : 'DISABLED (Postman testing mode)'}`)

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`)
        })
    } catch (error) {
        console.error('❌ Database connection failed:', error.message)
        process.exit(1)
    }
}

startServer()