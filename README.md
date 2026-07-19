Overview
Your task is to build a complete Retrieval-Augmented Generation (RAG) system with:

Semantic chunking (using configurable chunk length)

Embeddings using HuggingFace Sentence Transformer model
sentence-transformers/all-MiniLM-L6-v2

Vector storage using ChromaDB

Reasoning / generation using the Gemini Flash 2.5 LLM

Environment-based configuration (.env files)

 

Requirements
Your implementation must use one of the provided starter templates for NodeJs, Python FastApi, and Dart. Links are provided in the resources below.

Ensure that, to function properly, your implementation does not require any other external intervention beyond setting up the `.env` file, installing dependencies and running `node main.js/main.ts` or `uvicorn main:app` or `dart main.dart`. If this is not the case, you will not get a passing score as no attempt will be made to fix your code.

Ensure that the following environment secrets are loaded from the `.env` file using the following names:

HuggingFace API key: HF_API_KEY

Embedding model name: EMBED_MODEL_NAME

Gemini API key: GEMINI_API_KEY

LLM model name: LLM_MODEL_NAME

Chroma DB host: CHROMA_DB_HOST

Chroma DB port: CHROMA_DB_PORT

Uploaded data directory: RAG_DATA_DIR

Chunk length for semantic chunking: CHUNK_LENGTH

Server port number: SERVER_PORT

Ensure all requirements/dependencies are listed in the appropriate requirements file: `package.json`, `requirements.txt`, or `pubspec.yaml`

Do NOT use LangChain for this implementation

Note that any other `.env` variable apart from the above may not be provided and should therefore have a default value.

 

Endpoint Requirements
At a minimum, your implementation must define the following three endpoints exactly as listed below.

/upload - Used to upload context files. Should be [POST]. Payload should be multipart/formdata and have files as the name of the uploaded document. There should be no other parameter in the payload

/prompt - Used to prompt the LLM and ask for information. Should be [POST]. Payload should be application/json and have query as the name of the prompt query. There should be no other required parameter

/health - Simple endpoint to return a 200 to indicate that the app is live. Should be [GET]

Ensure that all endpoints are defined in the main file.
