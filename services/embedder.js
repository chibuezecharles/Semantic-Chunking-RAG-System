const { InferenceClient } = require("@huggingface/inference");

const MODEL =
    process.env.EMBED_MODEL_NAME ||
    "sentence-transformers/all-MiniLM-L6-v2";

const API_KEY = process.env.HF_API_KEY;

const client = new InferenceClient(API_KEY);

function normalize(vector) {
    const magnitude = Math.sqrt(
        vector.reduce((sum, value) => sum + value * value, 0)
    );

    if (!magnitude) {
        return vector;
    }

    return vector.map((value) => value / magnitude);
}

async function requestEmbedding(inputs) {
    try {
        const embeddings = await client.featureExtraction({
            model: MODEL,
            inputs,
        });

        return embeddings;
    } catch (error) {
        console.error(
            "Hugging Face embedding error:",
            error.response?.data || error.message
        );
        throw error;
    }
}

async function embed(text) {
    const embedding = await requestEmbedding(text);

    return normalize(embedding);
}

async function embedTexts(texts) {
    if (!texts.length) {
        return [];
    }

    const embeddings = await requestEmbedding(texts);

    return embeddings.map(normalize);
}

module.exports = {
    embed,
    embedTexts,
};