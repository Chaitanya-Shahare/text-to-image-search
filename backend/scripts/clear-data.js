const fs = require('fs');
const path = require('path');
const Image = require('../src/models/Image');
const sequelize = require('../src/config/database');

async function clearData() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connection OK.');

        // 1. Truncate Table
        console.log('Truncating "Images" table...');
        await Image.destroy({
            where: {},
            truncate: true
        });
        console.log('Database cleared.');

        // 2. Clear Uploads Folder
        const uploadsDir = path.join(__dirname, '../uploads');
        if (fs.existsSync(uploadsDir)) {
            console.log(`Cleaning uploads directory: ${uploadsDir}`);
            const files = fs.readdirSync(uploadsDir);
            
            for (const file of files) {
                // Skip .gitkeep or similar if you want to keep them, generally fine to wipe all
                if (file === '.gitignore') continue; 
                
                fs.unlinkSync(path.join(uploadsDir, file));
            }
            console.log(`Deleted ${files.length} files from uploads.`);
        } else {
            console.log('Uploads directory does not exist.');
        }

        console.log('SUCCESS: All data cleared.');

    } catch (error) {
        console.error('Cleanup failed:', error);
    } finally {
        await sequelize.close();
    }
}

clearData();
