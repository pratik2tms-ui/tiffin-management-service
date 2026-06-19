const { DataTypes, Model } = require('sequelize')
const sequelize = require('../config/database')

class TiffinEntry extends Model { }

TiffinEntry.init({
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
    userId: { type: DataTypes.BIGINT, field: 'user_id', allowNull: false },
    centerId: { type: DataTypes.BIGINT, field: 'center_id', allowNull: false },
    pricingId: { type: DataTypes.BIGINT, field: 'pricing_id' },
    entryDate: { type: DataTypes.DATEONLY, field: 'entry_date', allowNull: false },
    shift: { type: DataTypes.ENUM('morning', 'night'), allowNull: false, defaultValue: 'morning' },
    tiffinType: { type: DataTypes.ENUM('full', 'half', 'chapati', 'bhakari', 'dalrice'), field: 'tiffin_type', allowNull: false },
    chapatiCount: { type: DataTypes.SMALLINT, field: 'chapati_count', defaultValue: 0 },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
    addedByRole: { type: DataTypes.ENUM('admin', 'center', 'user'), field: 'added_by_role', allowNull: false },
    note: { type: DataTypes.TEXT },
    isNoTiffin: { type: DataTypes.BOOLEAN, field: 'is_no_tiffin', defaultValue: false },
    approvedBy: { type: DataTypes.BIGINT, field: 'approved_by' },
    approvedAt: { type: DataTypes.DATE, field: 'approved_at' },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_deleted' },
    meta: { type: DataTypes.JSONB, defaultValue: {} },
    createdBy: { type: DataTypes.BIGINT, field: 'created_by' },
    modifiedBy: { type: DataTypes.BIGINT, field: 'modified_by' },
}, {
    sequelize,
    modelName: 'TiffinEntry',
    tableName: 'tiffin_entries',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'modified_at',
})

TiffinEntry.associate = (models) => {
    TiffinEntry.belongsTo(models.User, { foreignKey: 'userId', as: 'user' })
    TiffinEntry.belongsTo(models.TiffinCenter, { foreignKey: 'centerId', as: 'center' })
    TiffinEntry.belongsTo(models.Pricing, { foreignKey: 'pricingId', as: 'pricing' })
    TiffinEntry.belongsTo(models.User, { foreignKey: 'approvedBy', as: 'approver' })
    TiffinEntry.hasMany(models.Approval, { foreignKey: 'entryId', as: 'approvals' })
}

module.exports = TiffinEntry