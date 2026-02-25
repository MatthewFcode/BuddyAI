## Buddy AI Overview 

Buddy AI Harry is a fullstack AI application that I am building to improve fluency and practical skill in designing AI software.  

I am aiming to understand how all layers of a production style AI systems fit together: frontend interaction, backend orchestration, database management, retrieval pipelines, streaming, voice capabilities, and tool execution.




## Architecture Overview
### Frontend (Next.js)

The frontend is built with Next.js and is responsible for:

- Rendering the user interface
- Managing client-side interaction
- Handling streaming responses
- Decoding binary chunks into readable text
- Supporting Text-to-Speech and Speech-to-Text functionality

The frontend communicates with backend API routes over HTTP and handles real-time response updates through streamed binary data.

### Backend (Next.js Serverless API Routes)

The backend uses Next.js serverless API functions as the communication layer to the AI functions.

Responsibilities include:

- Receiving the user input
- Calling the AI function
- Performing retrieval operations
- Executing tools
- Communicating with the database via Prisma
- Streaming responses back to the client

### Database and ORM

Prisma is used as the ORM to manage structured data.

The backend communicates with Prisma over HTTP to perform database operations.

For vector storage:

- Supabase is used as the vector database.

## Retrieval-Augmented Generation (RAG)

The AI system is grounded in personal context through retrieval.

The RAG pipeline works as follows:

1. Source material is chunked into smaller segments.
2. A local Hugging Face model generates embeddings for each chunk.
3. Embeddings are stored in Supabase.
4. Semantic search retrieves the most relevant chunks at query time.
5. Retrieved context is injected into the model prompt.
6. The model generates a response grounded in that retrieved data.

This ensures responses are aligned with the personal knowledge I choose to embed into the vector store.

## Tooling and External Integrations

The AI is extended with tooling capabilities. It can:

- Send emails via third-party APIs
- Send messages via third-party APIs
- Search the web using the Model Context Protocol


### The next steps for this project are:

- Expanding tool usage to increase system capability
- Implementing WebSockets to improve streaming efficiency
- Refining the RAG pipeline for better retrieval quality and more efficient token usage
- Implementing custom auth in order to keep API routes protected and prevent external use of the application.