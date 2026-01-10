const ClipService = require('../src/services/clipService');

async function test() {
    try {
        console.log('Testing Text Embedding...');
        const textEmb = await ClipService.generateTextEmbedding('a red car');
        console.log('Text Embedding received. Length:', textEmb.length);
        console.log('First 5 values:', textEmb.slice(0, 5));

        console.log('\nTesting Image Embedding (remote URL)...');
        // Using a standard test image
        const imageUrl = 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';
        const imageEmb = await ClipService.generateImageEmbedding(imageUrl);
        console.log('Image Embedding received. Length:', imageEmb.length);
        console.log('First 5 values:', imageEmb.slice(0, 5));

        if (textEmb.length === 512 && imageEmb.length === 512) {
            console.log('\nSUCCESS: Both embeddings have correct dimension (512).');
        } else {
            console.error('\nFAILURE: Incorrect dimensions.');
            process.exit(1);
        }

    } catch (error) {
        console.error('Error during test:');
        console.error(error);
        process.exit(1);
    }
}

test();
