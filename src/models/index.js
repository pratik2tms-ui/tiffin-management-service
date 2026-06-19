const fs = require('fs')
const path = require('path')
const sequelize = require('../config/database')

const db = {}
const basename = path.basename(__filename)

// Auto-load every model file in this folder
fs.readdirSync(__dirname)
    .filter(file =>
        file !== basename &&
        file.endsWith('.js')
    )
    .forEach(file => {
        const model = require(path.join(__dirname, file))
        db[model.name] = model
    })

// Run associations if defined
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db)
    }
})

db.sequelize = sequelize
db.Sequelize = require('sequelize')

module.exports = db