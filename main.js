require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");

const { extractText } = require("./services/parser");
const { semanticChunk } = require("./services/chunker");
const { embed, embedTexts } = require("./services/embedder");
const {
    initializeCollection,
    addDocuments,
    search,
} = require("./services/chroma");
const { askGemini } = require("./services/gemini");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.SERVER_PORT || 3000;

const uploadDir =
    process.env.RAG_DATA_DIR || "./uploads";

fs.ensureDirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, uploadDir);
    },

    filename: (_, file, cb) => {
        cb(
            null,
            `${Date.now()}-${file.originalname}`
        );
    },
});

const upload = multer({
    storage,

    fileFilter(req, file, cb) {
        const allowed = [
            ".pdf",
            ".txt",
            ".docx",
            ".md",
        ];

        const ext = path
            .extname(file.originalname)
            .toLowerCase();

        if (allowed.includes(ext)) {
            return cb(null, true);
        }

        cb(
            new Error(
                "Only PDF, TXT, DOCX and Markdown files are allowed."
            )
        );
    },
});

initializeCollection()
    .then(() => {
        console.log("✓ ChromaDB initialized");
    })
    .catch((err) => {
        console.error("Failed to initialize ChromaDB");
        console.error(err);
    });

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
    });
});

app.post(
    "/upload",
    upload.array("files"),
    async (req, res) => {
        
        try {
            if (
                !req.files ||
                req.files.length === 0
            ) {
                return res.status(400).json({
                    error: "No files uploaded.",
                });
            }

            let totalChunks = 0;

            for (const file of req.files) {
                try {
                    const text =
                        await extractText(file.path);

                    const chunks =
                        await semanticChunk(
                            text,
                            Number(
                                process.env
                                    .CHUNK_LENGTH || 500
                            )
                        );

                    if (!chunks.length) {
                        continue;
                    }

                    // Batch embedding request
                    const embeddings =
                        await embedTexts(chunks);

                    await addDocuments(
                        chunks,
                        embeddings,
                        file.originalname
                    );
                    console.log("Saved");

                    totalChunks += chunks.length;
                } finally {
                    // Delete uploaded file after processing
                    await fs.remove(file.path);
                }
            }

            res.status(200).json({
                success: true,
                chunksIndexed: totalChunks,
            });
        } catch (err) {
            console.error(err);

            res.status(500).json({
                error: err.message,
            });
        }
    }
);

app.post("/prompt", async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({
                error: "query is required",
            });
        }

        // Embed the user's question
        const queryEmbedding =
            await embed(query);

        // Search ChromaDB
        const result =
            await search(queryEmbedding);

        if (
            !result.documents ||
            !result.documents.length ||
            !result.documents[0].length
        ) {
            return res.status(200).json({
                answer:
                    "I couldn't find any relevant information in the uploaded documents.",
                context: "",
            });
        }

            const context = [...new Set(result.documents[0])].join("\n\n");

        const answer =
            await askGemini(query, context);

        res.status(200).json({
            answer,
            context,
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: err.message,
        });
    }
});

app.listen(PORT, () => {
    console.log(
        `RAG server running on http://localhost:${PORT}`
    );
});