const { 
    AutoTokenizer, 
    CLIPTextModelWithProjection, 
    AutoProcessor, 
    CLIPVisionModelWithProjection, 
    RawImage 
} = require('@xenova/transformers');

class ClipService {
    static tokenizer = null;
    static textModel = null;
    static processor = null;
    static visionModel = null;
    static modelId = 'Xenova/clip-vit-base-patch16'; // Higher accuracy

    static async loadModels() {
        if (!ClipService.tokenizer) {
            console.log('Loading CLIP components...');
            
            // Load models in parallel for speed
            const [tokenizer, textModel, processor, visionModel] = await Promise.all([
                AutoTokenizer.from_pretrained(ClipService.modelId),
                CLIPTextModelWithProjection.from_pretrained(ClipService.modelId),
                AutoProcessor.from_pretrained(ClipService.modelId),
                CLIPVisionModelWithProjection.from_pretrained(ClipService.modelId)
            ]);

            ClipService.tokenizer = tokenizer;
            ClipService.textModel = textModel;
            ClipService.processor = processor;
            ClipService.visionModel = visionModel;
            console.log('CLIP components loaded.');
        }
    }

    /**
     * Generate normalized text embedding.
     * @param {string} text 
     * @returns {Promise<number[]>}
     */
    static async generateTextEmbedding(text) {
        await ClipService.loadModels();
        
        // Tokenize
        const inputs = await ClipService.tokenizer([text], { padding: true, truncation: true });
        
        // Generate embedding
        const { text_embeds } = await ClipService.textModel(inputs);
        
        // Normalize and return array
        return ClipService.normalize(text_embeds.data);
    }

    /**
     * Generate normalized image embedding.
     * @param {string} imagePath - Absolute path or URL
     * @returns {Promise<number[]>}
     */
    static async generateImageEmbedding(imagePath) {
        await ClipService.loadModels();
        
        // Read image
        // RawImage.read works with local paths and URLs in Node.js
        const image = await RawImage.read(imagePath);
        
        // Process image
        const inputs = await ClipService.processor(image);
        
        // Generate embedding
        const { image_embeds } = await ClipService.visionModel(inputs);
        
        // Normalize and return array
        return ClipService.normalize(image_embeds.data);
    }

    /**
     * Perform Zero-Shot Classification.
     * Computes similarity between the image and a list of candidate tags.
     * @param {string} imagePath 
     * @param {string[]} candidateTags 
     * @param {number} threshold - Minimum score to include tag (default 0.2)
     * @returns {Promise<string[]>}
     */
    static async generateZeroShotTags(imagePath, candidateTags, threshold = 0.2) {
        await ClipService.loadModels();

        // 1. Get Image Embedding
        const imageEmbedding = await ClipService.generateImageEmbedding(imagePath);

        // 2. Get Text Embeddings for candidates
        // Note: For large lists, specialized bulk processing is better, but this works for MVP
        const selectedTags = [];
        
        for (const tag of candidateTags) {
            const textEmbedding = await ClipService.generateTextEmbedding(`a photo of a ${tag}`);
            
            // Dot product (Cosine Similarity since normalized)
            let score = 0;
            for (let i = 0; i < imageEmbedding.length; i++) {
                score += imageEmbedding[i] * textEmbedding[i];
            }

            if (score > threshold) {
                selectedTags.push({ tag, score });
            }
        }

        // Sort by score
        selectedTags.sort((a, b) => b.score - a.score);
        
        // Return just the strings
        return selectedTags.map(t => t.tag);
    }

    static normalize(vectorData) {
        // Calculate L2 norm
        let norm = 0;
        for (let i = 0; i < vectorData.length; i++) {
            norm += vectorData[i] * vectorData[i];
        }
        norm = Math.sqrt(norm);
        
        // Avoid division by zero
        if (norm === 0) return Array.from(vectorData);
        
        // Return normalized array
        return Array.from(vectorData).map(x => x / norm);
    }
}

module.exports = ClipService;
