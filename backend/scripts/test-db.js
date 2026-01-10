const sequelize = require('../src/config/database');
const Image = require('../src/models/Image');

async function test() {
    try {
        console.log('Syncing database...');
        await sequelize.sync({ force: true }); // Recreate table
        console.log('Database synced.');

        console.log('Creating test record...');
        const image = await Image.create({
            filename: 'test.jpg',
            path: '/uploads/test.jpg',
            mimetype: 'image/jpeg',
            size: 1024,
            embedding: [0.1, 0.2, 0.3],
            tags: ['test', 'car']
        });
        console.log('Record created with ID:', image.id);

        console.log('Fetching record...');
        const fetched = await Image.findByPk(image.id);
        
        if (fetched.filename === 'test.jpg' && fetched.tags[0] === 'test') {
            console.log('SUCCESS: Record verified.');
            console.log('Embedding type:', Array.isArray(fetched.embedding) ? 'Array' : typeof fetched.embedding);
        } else {
            console.error('FAILURE: Data mismatch.');
            process.exit(1);
        }

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

test();
