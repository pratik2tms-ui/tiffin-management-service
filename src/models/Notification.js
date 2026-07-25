const { DataTypes, Model } = require('sequelize')
const sequelize = require('../config/database')

class Notification extends Model { }

Notification.init({
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
    userId: { type: DataTypes.BIGINT, field: 'user_id', allowNull: false },
    entryId: { type: DataTypes.BIGINT, field: 'entry_id' },
    centerId: { type: DataTypes.BIGINT, field: 'center_id' },
    type: { type: DataTypes.ENUM('new_tiffin_request', 'tiffin_status_update', 'tiffin_reminder'), allowNull: false },
    title: { type: DataTypes.STRING(150), allowNull: false },
    body: { type: DataTypes.STRING(300), allowNull: false },
    data: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
    status: { type: DataTypes.ENUM('sent', 'failed', 'skipped'), allowNull: false, defaultValue: 'sent' },
    errorMessage: { type: DataTypes.TEXT, field: 'error_message' },
    isSeen: { type: DataTypes.BOOLEAN, field: 'is_seen', allowNull: false, defaultValue: false },
    seenAt: { type: DataTypes.DATE, field: 'seen_at' },
}, {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    underscored: true,
    timestamps: true,
    updatedAt: false,
})

Notification.associate = (models) => {
    Notification.belongsTo(models.User, { foreignKey: 'userId', as: 'user' })
    Notification.belongsTo(models.TiffinEntry, { foreignKey: 'entryId', as: 'entry' })
    Notification.belongsTo(models.TiffinCenter, { foreignKey: 'centerId', as: 'center' })
}

module.exports = Notification
