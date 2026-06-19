const { DataTypes, Model } = require('sequelize')
const sequelize = require('../config/database')

class Approval extends Model { }

Approval.init({
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    entryId: { type: DataTypes.BIGINT, field: 'entry_id', allowNull: false },
    reviewedBy: { type: DataTypes.BIGINT, field: 'reviewed_by', allowNull: false },
    centerId: { type: DataTypes.BIGINT, field: 'center_id', allowNull: false },
    action: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), allowNull: false },
    previousStatus: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), field: 'previous_status' },
    newStatus: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), field: 'new_status', allowNull: false },
    reason: { type: DataTypes.TEXT },
    meta: { type: DataTypes.JSONB, defaultValue: {} },
    createdBy: { type: DataTypes.BIGINT, field: 'created_by' },
}, {
    sequelize,
    modelName: 'Approval',
    tableName: 'approvals',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,   // immutable — no modified field
})

Approval.associate = (models) => {
    Approval.belongsTo(models.TiffinEntry, { foreignKey: 'entryId', as: 'entry' })
    Approval.belongsTo(models.User, { foreignKey: 'reviewedBy', as: 'reviewer' })
}

module.exports = Approval