const { DataTypes, Model } = require('sequelize')
const sequelize = require('../config/database')

class Payment extends Model { }

Payment.init({
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
    userId: { type: DataTypes.BIGINT, field: 'user_id', allowNull: false },
    centerId: { type: DataTypes.BIGINT, field: 'center_id', allowNull: false },
    periodMonth: { type: DataTypes.SMALLINT, field: 'period_month', allowNull: false },
    periodYear: { type: DataTypes.SMALLINT, field: 'period_year', allowNull: false },
    totalDue: { type: DataTypes.DECIMAL(10, 2), field: 'total_due', allowNull: false },
    amountPaid: { type: DataTypes.DECIMAL(10, 2), field: 'amount_paid', defaultValue: 0 },
    balanceDue: { type: DataTypes.VIRTUAL },   // generated column — read-only, computed by Postgres
    status: { type: DataTypes.ENUM('unpaid', 'partial', 'paid'), defaultValue: 'unpaid' },
    paymentMethod: { type: DataTypes.ENUM('cash', 'upi', 'bank', 'card'), field: 'payment_method' },
    paymentReference: { type: DataTypes.STRING(100), field: 'payment_reference' },
    paidAt: { type: DataTypes.DATE, field: 'paid_at' },
    notes: { type: DataTypes.TEXT },
    transactions: { type: DataTypes.JSONB, defaultValue: [] },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_deleted' },
    meta: { type: DataTypes.JSONB, defaultValue: {} },
    createdBy: { type: DataTypes.BIGINT, field: 'created_by' },
    modifiedBy: { type: DataTypes.BIGINT, field: 'modified_by' },
}, {
    sequelize,
    modelName: 'Payment',
    tableName: 'payments',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'modified_at',
})

Payment.associate = (models) => {
    Payment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' })
    Payment.belongsTo(models.TiffinCenter, { foreignKey: 'centerId', as: 'center' })
}

module.exports = Payment