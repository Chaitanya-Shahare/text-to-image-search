const express = require('express');
const ClipService = require('../services/clipService');
const Image = require('../models/Image');
const VectorUtils = require('../utils/vectorUtils');

const router = express.Router();

// GET /api/search?q=query_string
router.get('/', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ error: 'Missing query parameter "q"' });
        }

        console.log(`Processing search for: "${query}"`);

        // 1. Generate Query Embedding
        const queryEmbedding = await ClipService.generateTextEmbedding(query);

        // 2. Fetch all images (MVP: fetch all, optimized: storing vectors in DB with extension)
        const allImages = await Image.findAll();

        if (allImages.length === 0) {
            return res.json([]);
        }

        // 3. Compute Similarities
        const results = allImages.map(img => {
            if (!img.embedding) return null;
            if (img.embedding.length !== queryEmbedding.length) {
                console.warn(`Skipping image ${img.id}: embedding dimension mismatch (${img.embedding.length} vs ${queryEmbedding.length})`);
                return null;
            }
            
            const score = VectorUtils.cosineSimilarity(queryEmbedding, img.embedding);
            return {
                id: img.id,
                filename: img.filename,
                path: img.path, // relative URL
                score: score,
                tags: img.tags
            };
        }).filter(r => r !== null);

        // 4. Sort by score (descending)
        results.sort((a, b) => b.score - a.score);

        // 5. Threshold Filter (default 0.2)
        const threshold = parseFloat(req.query.threshold) || 0.2;
        const filteredResults = results.filter(r => r.score >= threshold);

        // 6. Top 10
        const topResults = filteredResults.slice(0, 10);

        res.json(topResults);

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to perform search' });
    }
});

module.exports = router;
