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
router.post('/', upload.array('images', 110), async (req, res) => {
    const sharp = require('sharp'); // Dynamic import or move to top

    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No image files provided' });
        }

        const uploadedImages = [];
        const errors = [];

        // Predefined candidate tags (could be moved to config)
        const candidateTags = [
            'red car', 'blue car', 'white car', 'black car', 'silver car',
            'sedan', 'suv', 'truck', 'coupe', 'convertible', 'hatchback',
            'toyota', 'honda', 'bmw', 'ford', 'mercedes', 'audi', 'tesla', 'ferrari', 'lamborghini',
            'luxury', 'sports car', 'vintage', 'family car'
        ];

        for (const file of req.files) {
            try {
                const filePath = file.path;
                console.log(`Processing upload: ${filePath}`);

                // 1. Extract Metadata with Sharp
                // Wrap in try-catch specifically for metadata to catch corrupt files early
                let metadata;
                try {
                    metadata = await sharp(filePath).metadata();
                } catch (sharpError) {
                    console.warn(`Skipping invalid image ${file.originalname}: ${sharpError.message}`);
                    errors.push({ filename: file.originalname, error: 'Invalid or unsupported image format' });
                    // Delete the invalid file to clean up
                    const fs = require('fs');
                    fs.unlink(filePath, () => {}); 
                    continue; // Skip this file
                }
                
                // 2. Generate Embedding
                const embedding = await ClipService.generateImageEmbedding(filePath);

                // 3. Generate AI Tags (Zero-Shot)
                // Threshold 0.2 is reasonable for CLIP
                const aiTags = await ClipService.generateZeroShotTags(filePath, candidateTags, 0.22);
                
                // Combine with basic heuristic tags if needed, but AI tags are superior
                const basicTags = generateBasicTags(file.originalname);
                const combinedTags = [...new Set([...aiTags, ...basicTags])];

                // 4. Store in DB
                const image = await Image.create({
                    filename: file.filename,
                    path: `/uploads/${file.filename}`,
                    mimetype: file.mimetype,
                    size: file.size,
                    width: metadata.width,
                    height: metadata.height,
                    embedding: embedding,
                    tags: combinedTags
                });

                uploadedImages.push({
                    id: image.id,
                    filename: image.filename,
                    tags: image.tags,
                    width: image.width,
                    height: image.height
                });

                console.log(`Processed ${file.filename}: ${combinedTags.join(', ')}`);

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
