const { DataTypes, Model } = require('sequelize')
const sequelize = require('../config/database')

class TiffinCenter extends Model { }

TiffinCenter.init({
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
    ownerId: { type: DataTypes.BIGINT, field: 'owner_id' },
    name: { type: DataTypes.STRING(150), allowNull: false },
    username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    phone: { type: DataTypes.STRING(20) },
    address: { type: DataTypes.TEXT },
    avatar: { type: DataTypes.STRING(10) },
    status: { type: DataTypes.ENUM('active', 'inactive', 'suspended'), defaultValue: 'active' },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_deleted' },
    meta: { type: DataTypes.JSONB, defaultValue: {} },
    createdBy: { type: DataTypes.BIGINT, field: 'created_by' },
    modifiedBy: { type: DataTypes.BIGINT, field: 'modified_by' },
}, {
    sequelize,
    modelName: 'TiffinCenter',
    tableName: 'tiffin_centers',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'modified_at',
})

TiffinCenter.associate = (models) => {
    TiffinCenter.hasMany(models.User, { foreignKey: 'centerId', as: 'customers' })
    TiffinCenter.hasMany(models.Pricing, { foreignKey: 'centerId', as: 'pricing' })
    TiffinCenter.hasMany(models.TiffinEntry, { foreignKey: 'centerId', as: 'entries' })
    TiffinCenter.belongsTo(models.User, { foreignKey: 'ownerId', as: 'owner' })
}

module.exports = TiffinCenter