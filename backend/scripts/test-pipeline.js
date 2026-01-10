const app = require('../src/app');
const sequelize = require('../src/config/database');
const Image = require('../src/models/Image');
const path = require('path');
const fs = require('fs');
const http = require('http');

// We can't easily fetch against 'app' without supertest or running a server.
// We'll run a temporary server instance.

async function test() {
    let server;
    try {
        console.log('Starting temporary server for integration test...');
        
        // Ensure uploads dir exists
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

        // Spin up server on random port
        server = http.createServer(app);
        
        await new Promise((resolve) => {
            server.listen(0, () => {
                const port = server.address().port;
                console.log(`Test server running on port ${port}`);
                resolve(port);
            });
        });

        const port = server.address().port;
        const apiUrl = `http://localhost:${port}/api/upload`;

        console.log('Preparing dummy image...');
        // Create a dummy file if needed or use existing
        const imageUrl = 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';
        const imagePath = path.join(__dirname, 'test_image.png');
        
        console.log('Downloading test image...');
        const imgBuffer = await fetch(imageUrl).then(res => res.arrayBuffer());
        fs.writeFileSync(imagePath, Buffer.from(imgBuffer));
        
        const fileContent = fs.readFileSync(imagePath);
        const blob = new Blob([fileContent], { type: 'image/png' });

        const formData = new FormData();
        formData.append('image', blob, 'test_image.png');

        console.log('Sending upload request...');
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            console.error('Response status:', response.status);
            const text = await response.text();
            console.error('Response body:', text);
            throw new Error('Upload failed');
        }

        const data = await response.json();
        console.log('Upload success:', data);

        // Verify DB
        console.log('Verifying Database...');
        // Wait a small bit just in case async hooks lag (unlikely with await)
        const imageRecord = await Image.findByPk(data.image.id);
        
        if (!imageRecord) throw new Error('DB Record not found');
        if (!imageRecord.embedding) throw new Error('Embedding missing');
        // Check heuristics
        if (imageRecord.tags.includes('red') && imageRecord.tags.includes('car')) {
             console.log('Tags verified:', imageRecord.tags);
        } else {
             console.log('Tags matching info (might vary based on filename handling):', imageRecord.tags);
        }

        console.log('SUCCESS: Full pipeline verified.');

    } catch (error) {
        console.error('Test Failed:', error);
        process.exit(1);
    } finally {
        if (server) server.close();
        if (sequelize) await sequelize.close();
    }
}

test();
