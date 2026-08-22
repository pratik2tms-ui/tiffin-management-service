const { DataTypes } = require('sequelize')

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction()
        try {
            // 1. Add available_days JSONB column to pricing table
            await queryInterface.addColumn(
                'pricing',
                'available_days',
                {
                    type: DataTypes.JSONB,
                    defaultValue: { "0": true, "1": true, "2": true, "3": true, "4": true, "5": true, "6": true }
                },
                { transaction }
            )

            // 2. Convert tiffin_type in pricing table to VARCHAR(50)
            await queryInterface.changeColumn(
                'pricing',
                'tiffin_type',
                {
                    type: DataTypes.STRING(50),
                    allowNull: false
                },
                { transaction }
            )

            // 3. Convert tiffin_type in tiffin_entries table to VARCHAR(50)
            await queryInterface.changeColumn(
                'tiffin_entries',
                'tiffin_type',
                {
                    type: DataTypes.STRING(50),
                    allowNull: false
                },
                { transaction }
            )

            await transaction.commit()
        } catch (error) {
            await transaction.rollback()
            throw error
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction()
        try {
            await queryInterface.removeColumn('pricing', 'available_days', { transaction })
            await transaction.commit()
        } catch (error) {
            await transaction.rollback()
            throw error
        }
    }
}
