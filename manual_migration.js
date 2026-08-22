const sequelize = require('./src/config/database');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        // Add available_days column
        await sequelize.query(`
            ALTER TABLE "pricing" 
            ADD COLUMN IF NOT EXISTS "available_days" JSONB DEFAULT '{"0": true, "1": true, "2": true, "3": true, "4": true, "5": true, "6": true}'::jsonb;
        `);
        console.log('Added available_days to pricing table.');

        // Alter tiffin_type to VARCHAR(50) in pricing
        await sequelize.query(`
            ALTER TABLE "pricing" 
            ALTER COLUMN "tiffin_type" TYPE VARCHAR(50);
        `);
        console.log('Altered tiffin_type in pricing table.');

        // Alter tiffin_type to VARCHAR(50) in tiffin_entries
        await sequelize.query(`
            ALTER TABLE "tiffin_entries" 
            ALTER COLUMN "tiffin_type" TYPE VARCHAR(50);
        `);
        console.log('Altered tiffin_type in tiffin_entries table.');

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
