const { DataTypes, Model } = require('sequelize')
const sequelize = require('../config/database')

class Pricing extends Model { }

Pricing.init({
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    centerId: { type: DataTypes.BIGINT, field: 'center_id', allowNull: false },
    tiffinType: { type: DataTypes.STRING(50), field: 'tiffin_type', allowNull: false },
    basePrice: { type: DataTypes.DECIMAL(10, 2), field: 'base_price', allowNull: false },
    defaultChapati: { type: DataTypes.SMALLINT, field: 'default_chapati', defaultValue: 0 },
    pricePerChapati: { type: DataTypes.DECIMAL(10, 2), field: 'price_per_chapati', defaultValue: 5.00 },
    isFixedPrice: { type: DataTypes.BOOLEAN, field: 'is_fixed_price', defaultValue: false },
    availableDays: { type: DataTypes.JSONB, field: 'available_days', defaultValue: { "0": true, "1": true, "2": true, "3": true, "4": true, "5": true, "6": true } },
    effectiveFrom: { type: DataTypes.DATEONLY, field: 'effective_from', defaultValue: DataTypes.NOW },
    effectiveTo: { type: DataTypes.DATEONLY, field: 'effective_to' },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_deleted' },
    meta: { type: DataTypes.JSONB, defaultValue: {} },
    createdBy: { type: DataTypes.BIGINT, field: 'created_by' },
    modifiedBy: { type: DataTypes.BIGINT, field: 'modified_by' },
}, {
    sequelize,
    modelName: 'Pricing',
    tableName: 'pricing',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'modified_at',
})

Pricing.associate = (models) => {
    Pricing.belongsTo(models.TiffinCenter, { foreignKey: 'centerId', as: 'center' })
    Pricing.hasMany(models.TiffinEntry, { foreignKey: 'pricingId', as: 'entries' })
}

module.exports = Pricing