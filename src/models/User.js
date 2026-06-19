const { DataTypes, Model } = require('sequelize')
const sequelize = require('../config/database')

class User extends Model { }

User.init({
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
    centerId: { type: DataTypes.BIGINT, field: 'center_id', allowNull: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: 'password_hash' },
    role: { type: DataTypes.ENUM('admin', 'center', 'user'), allowNull: false, defaultValue: 'user' },
    phone: { type: DataTypes.STRING(20) },
    avatar: { type: DataTypes.STRING(10) },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_deleted' },
    meta: { type: DataTypes.JSONB, defaultValue: {} },
    createdBy: { type: DataTypes.BIGINT, field: 'created_by' },
    modifiedBy: { type: DataTypes.BIGINT, field: 'modified_by' },
}, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'modified_at',
})

User.associate = (models) => {
    User.belongsTo(models.TiffinCenter, { foreignKey: 'centerId', as: 'center' })
    User.hasMany(models.TiffinEntry, { foreignKey: 'userId', as: 'tiffinEntries' })
    User.hasMany(models.Payment, { foreignKey: 'userId', as: 'payments' })
}

module.exports = User