require('dotenv').config()
const createApp = require('./src/config/app')
const db = require('./src/models')
const routes = require('./src/routes')

const app = createApp()
const PORT = process.env.PORT || 5000

app.use('/api', routes)

app.use((req, res) => {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } })
})

const startServer = async () => {
    try {
        await db.sequelize.authenticate()
        console.log('✅ Database connected successfully')
        console.log(`📦 Environment: ${process.env.NODE_ENV}`)
        console.log(`🔐 Encryption: ${process.env.ENCRYPTION_ENABLED === 'true' ? 'ENABLED' : 'DISABLED (Postman testing mode)'}`)

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`)
        })
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error.message)
        process.exit(1)
    }
}

startServer()