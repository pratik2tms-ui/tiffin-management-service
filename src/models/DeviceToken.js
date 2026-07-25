const { DataTypes, Model } = require('sequelize')
const sequelize = require('../config/database')

class DeviceToken extends Model { }

DeviceToken.init({
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.BIGINT, field: 'user_id', allowNull: false },
    deviceId: { type: DataTypes.STRING(100), field: 'device_id', allowNull: false, unique: true },
    fcmToken: { type: DataTypes.STRING(255), field: 'fcm_token', allowNull: false },
    platform: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'web' },
    deviceLabel: { type: DataTypes.STRING(100), field: 'device_label' },
    isActive: { type: DataTypes.BOOLEAN, field: 'is_active', allowNull: false, defaultValue: true },
    lastActiveAt: { type: DataTypes.DATE, field: 'last_active_at', allowNull: false, defaultValue: DataTypes.NOW },
}, {
    sequelize,
    modelName: 'DeviceToken',
    tableName: 'device_tokens',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'modified_at',
})

DeviceToken.associate = (models) => {
    DeviceToken.belongsTo(models.User, { foreignKey: 'userId', as: 'user' })
}

module.exports = DeviceToken
