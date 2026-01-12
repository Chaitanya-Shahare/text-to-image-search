const fs = require('fs');
const path = require('path');
const https = require('https');

const OUTPUT_DIR = path.join(__dirname, '../../dataset');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

const colors = ['red', 'blue', 'green', 'black', 'white', 'silver', 'yellow'];
const types = ['sedan', 'suv', 'truck', 'coupe', 'convertible', 'hatchback'];
const brands = ['toyota', 'honda', 'bmw', 'ford', 'mercedes', 'audi', 'tesla'];

const TOTAL_IMAGES = 100;

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function downloadImage(idx) {
    const color = getRandom(colors);
    const type = getRandom(types);
    const brand = getRandom(brands);
    
    // Construct filename for verification later: color_brand_type_index.jpg
    const filename = `${color}_${brand}_${type}_${Date.now()}_${idx}.jpg`;
    const filePath = path.join(OUTPUT_DIR, filename);

    // LoremFlickr URL with keywords
    const url = `https://loremflickr.com/640/480/${color},${type},${brand},car/all?random=${idx}`;

    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath);
        https.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                 let redirectUrl = response.headers.location;
                 // Handle relative URL
                 if (redirectUrl && !redirectUrl.startsWith('http')) {
                     const originalUrlObj = new URL(url);
                     redirectUrl = `${originalUrlObj.protocol}//${originalUrlObj.host}${redirectUrl}`;
                 }

                 https.get(redirectUrl, (redirectResponse) => {
                     redirectResponse.pipe(file);
                     file.on('finish', () => {
                         file.close();
                         console.log(`[${idx+1}/${TOTAL_IMAGES}] Downloaded ${filename}`);
                         resolve();
                     });
                 }).on('error', (err) => {
                     fs.unlink(filePath, () => {});
                     console.error(`Redirect error for ${filename}:`, err.message);
                     resolve(); // Convert reject to resolve to skip bad files instead of crash
                 });
                 return;
            }

            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`[${idx+1}/${TOTAL_IMAGES}] Downloaded ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filePath, () => {});
            console.error(`Error downloading ${filename}:`, err.message);
            resolve(); // Resolve anyway to continue loop
        });
    });
}

async function run() {
    console.log(`Starting download of ${TOTAL_IMAGES} images to ${OUTPUT_DIR}...`);
    
    // Download in chunks to avoid overwhelming connection
    const CHUNK_SIZE = 5;
    for (let i = 0; i < TOTAL_IMAGES; i += CHUNK_SIZE) {
        const chunk = [];
        for (let j = 0; j < CHUNK_SIZE && (i + j) < TOTAL_IMAGES; j++) {
            chunk.push(downloadImage(i + j));
            // Add slight delay between requests
            await new Promise(r => setTimeout(r, 200));
        }
        await Promise.all(chunk);
    }
    
    console.log('Download complete.');
}

run();
