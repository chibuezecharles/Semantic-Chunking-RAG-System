const { ChromaClient } = require("chromadb");

const client = new ChromaClient({
    path: `http://${process.env.CHROMA_DB_HOST}:${process.env.CHROMA_DB_PORT}`,
});

let collection;
const crypto = require("crypto");

async function initializeCollection() {
    try {
        await client.deleteCollection({
            name: "rag_documents",
        });
        
    } catch (err) {
        console.log("No existing collection found");
    }

    collection = await client.getOrCreateCollection({
        name: "rag_documents",
    });

    return collection;
}

async function addDocuments(chunks, embeddings, filename) {
    if (!collection) {
        await initializeCollection();
    }

    await collection.add({
        ids: chunks.map(() => crypto.randomUUID()),
        documents: chunks,
        embeddings,
        metadatas: chunks.map((_, index) => ({
            filename,
            chunkIndex: index,
            uploadedAt: new Date().toISOString()
        }))
    });
}

async function search(queryEmbedding) {
    if (!collection) {
        await initializeCollection();
    }

    const result =  await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: 10,
        include: ["documents", "metadatas", "distances"],
    });

    return result;
}

module.exports = {
    initializeCollection,
    addDocuments,
    search,
};