class VectorUtils {
    /**
     * Compute cosine similarity between two normalized vectors.
     * Since vectors are normalized (magnitude = 1), cosine similarity is just the dot product.
     * @param {number[]} v1 
     * @param {number[]} v2 
     * @returns {number} - Similarity score (-1 to 1)
     */
    static cosineSimilarity(v1, v2) {
        if (v1.length !== v2.length) {
            throw new Error('Vector dimension mismatch');
        }
        
        let dotProduct = 0;
        for (let i = 0; i < v1.length; i++) {
            dotProduct += v1[i] * v2[i];
        }
        
        // Return dot product (since ||v1|| = ||v2|| = 1 already from ClipService.normalize)
        return dotProduct;
    }
}

module.exports = VectorUtils;
