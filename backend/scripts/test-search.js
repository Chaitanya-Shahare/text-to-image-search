const app = require('../src/app');
const sequelize = require('../src/config/database');
const http = require('http');

async function test() {
    let server;
    try {
        console.log('Starting temporary server for search test...');
        
        server = http.createServer(app);
        await new Promise((resolve) => {
            server.listen(0, () => {
                const port = server.address().port;
                console.log(`Test server running on port ${port}`);
                resolve(port);
            });
        });

        const port = server.address().port;
        const apiUrl = `http://localhost:${port}/api/search?q=car`;

        console.log('Sending search request...');
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Search failed: ${response.status}`);
        }

        const results = await response.json();
        console.log('Search Results:', JSON.stringify(results, null, 2));

        if (Array.isArray(results)) {
            console.log(`SUCCESS: Received ${results.length} results.`);
            if (results.length > 0) {
                console.log('Top result score:', results[0].score);
            }
        } else {
            console.error('FAILURE: Results is not an array.');
            process.exit(1);
        }

    } catch (error) {
        console.error('Test Failed:', error);
        process.exit(1);
    } finally {
        if (server) server.close();
        if (sequelize) await sequelize.close();
    }
}

test();
