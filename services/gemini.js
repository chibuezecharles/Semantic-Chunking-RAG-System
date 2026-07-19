const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

async function askGemini(question, context) {
    const prompt = `
You are a Retrieval-Augmented Generation assistant.

Answer the question using ONLY the provided context.

If the answer is explicitly present in the context, answer briefly and accurately.

If the answer cannot be determined from the context, respond exactly with:

"I don't know."

Do not use outside knowledge.

Context:

${context}

Question:

${question}
`;

    const response =
        await ai.models.generateContent({
            model: process.env.LLM_MODEL_NAME,
            contents: prompt,
        });

    return response.text;
}

module.exports = {
    askGemini,
};