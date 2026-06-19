const { Sequelize } = require('sequelize')
const config = require('./config.json')

const env = process.env.NODE_ENV || 'development'
const dbConfig = config[env]

if (!dbConfig) {
    throw new Error(`No database config found for environment: ${env}`)
}

const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: dbConfig.logging ? console.log : false,
        pool: dbConfig.pool,
        dialectOptions: dbConfig.dialectOptions || {},
    }
)

module.exports = sequelize