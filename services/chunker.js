const { embedTexts } = require("./embedder");

const SIMILARITY_THRESHOLD = 0.45;

// function splitIntoSentences(text) {
//     return (
//         text
//             .replace(/\r\n/g, "\n")
//             .match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []
//     )
//         .map((s) => s.trim())
//         .filter(Boolean);
// }

function splitIntoParagraphs(text) {
    return text
        .replace(/\r\n/g, "\n")
        .replace(/\n{2,}/g, "\n")
        .split(/\n(?=[A-Z])/)
        .map(s => s.trim())
        .filter(Boolean);
}

function cosineSimilarity(a, b) {
    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (!normA || !normB) {
        return 0;
    }

    return dot / (normA * normB);
}

async function semanticChunk(
    text,
    chunkLength = Number(process.env.CHUNK_LENGTH || 500)
) {
    const sentences = splitIntoParagraphs(text);

    if (!sentences.length) {
        return [];
    }

    if (sentences.length === 1) {
        return sentences;
    }

    const embeddings = await embedTexts(sentences);

    const chunks = [];

    let currentChunk = sentences[0];

    let currentEmbedding = embeddings[0];

    for (let i = 1; i < sentences.length; i++) {
        const similarity = cosineSimilarity(
            currentEmbedding,
            embeddings[i]
        );

        const candidate =
            currentChunk + " " + sentences[i];

        const exceedsLength =
            candidate.length > chunkLength;

        if (
            similarity >= SIMILARITY_THRESHOLD &&
            !exceedsLength
        ) {
            currentChunk = candidate;
            currentEmbedding = embeddings[i];
        } else {
            chunks.push(currentChunk.trim());

            currentChunk = sentences[i];
            currentEmbedding = embeddings[i];
        }
    }

    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

module.exports = {
    semanticChunk,
};