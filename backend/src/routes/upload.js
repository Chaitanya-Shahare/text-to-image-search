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
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const filePath = req.file.path;
        console.log(`Processing upload: ${filePath}`);

        // 1. Generate Embedding
        const embedding = await ClipService.generateImageEmbedding(filePath);

        // 2. Generate Basic Tags (Heuristic for now)
        // We will improve this in Task 2.3
        const tags = generateBasicTags(req.file.originalname);

        // 3. Store in DB
        const image = await Image.create({
            filename: req.file.filename,
            path: `/uploads/${req.file.filename}`, // Relative path for serving
            mimetype: req.file.mimetype,
            size: req.file.size,
            embedding: embedding,
            tags: tags
        });

        res.json({
            message: 'Image uploaded and processed successfully',
            image: {
                id: image.id,
                filename: image.filename,
                tags: image.tags
            }
        });

    } catch (error) {
        console.error('Upload processing error:', error);
        res.status(500).json({ error: 'Failed to process image' });
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
