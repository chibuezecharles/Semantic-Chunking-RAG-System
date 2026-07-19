const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");

async function extractText(filePath) {
    const extension = path.extname(filePath).toLowerCase();

    switch (extension) {
        case ".txt": {
            const text = fs.readFileSync(filePath, "utf8").trim();

            if (!text) {
                throw new Error("TXT file is empty.");
            }

            return text;
        }

        case ".md": {
            const text = fs.readFileSync(filePath, "utf8").trim();

            if (!text) {
                throw new Error("Markdown file is empty.");
            }

            return text;
        }

        case ".pdf": {
            const buffer = fs.readFileSync(filePath);

            const data = await pdf(buffer);

            const text = data.text.trim();

            if (!text) {
                throw new Error("PDF contains no readable text.");
            }

            return text;
        }

        case ".docx": {
            const result =
                await mammoth.extractRawText({
                    path: filePath,
                });

            const text = result.value.trim();

            if (!text) {
                throw new Error("DOCX contains no readable text.");
            }

            return text;
        }

        default:
            throw new Error(
                `Unsupported file type: ${extension}`
            );
    }
}

module.exports = {
    extractText,
};