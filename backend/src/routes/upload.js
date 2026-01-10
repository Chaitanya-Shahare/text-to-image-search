const express = require('express');
const multer = require('multer');
const path = require('path');
const ClipService = require('../services/clipService');
const Image = require('../models/Image');

const router = express.Router();

// Configure Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// POST /api/upload
router.post('/', upload.array('images', 20), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No image files provided' });
        }

        const uploadedImages = [];
        const errors = [];

        for (const file of req.files) {
            try {
                const filePath = file.path;
                console.log(`Processing upload: ${filePath}`);

                // 1. Generate Embedding
                const embedding = await ClipService.generateImageEmbedding(filePath);

                // 2. Generate Basic Tags
                const tags = generateBasicTags(file.originalname);

                // 3. Store in DB
                const image = await Image.create({
                    filename: file.filename,
                    path: `/uploads/${file.filename}`,
                    mimetype: file.mimetype,
                    size: file.size,
                    embedding: embedding,
                    tags: tags
                });

                uploadedImages.push({
                    id: image.id,
                    filename: image.filename,
                    tags: image.tags
                });

            } catch (err) {
                console.error(`Failed to process ${file.originalname}:`, err);
                errors.push({ filename: file.originalname, error: err.message });
            }
        }

        res.json({
            message: `Processed ${uploadedImages.length} images successfully.`,
            images: uploadedImages,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Upload processing error:', error);
        res.status(500).json({ error: 'Failed to process upload request' });
    }
});

function generateBasicTags(originalName) {
    const tags = [];
    const lowerName = originalName.toLowerCase();
    
    // Simple keyword extraction based on file name
    const colors = ['red', 'blue', 'green', 'black', 'white', 'silver', 'grey', 'yellow'];
    const types = ['sedan', 'suv', 'truck', 'coupe', 'convertible', 'hatchback'];
    const brands = ['toyota', 'honda', 'bmw', 'ford', 'mercedes', 'audi', 'tesla'];

    colors.forEach(c => { if (lowerName.includes(c)) tags.push(c); });
    types.forEach(t => { if (lowerName.includes(t)) tags.push(t); });
    brands.forEach(b => { if (lowerName.includes(b)) tags.push(b); });

    return tags;
}

module.exports = router;
