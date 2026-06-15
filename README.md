# AI Memory Retrieval Assistant

## Overview

The AI Memory Retrieval Assistant is a local-first, open-source system designed to enable semantic search and retrieval across personal communication data. It integrates Gmail and Telegram messages into a unified knowledge base using embeddings, hybrid search, and Retrieval-Augmented Generation (RAG).

The system allows users to query their communication history using natural language instead of keyword-based search.

---

## Key Features

* Gmail integration via OAuth 2.0
* Telegram integration using Telethon
* Incremental synchronization for efficient data updates
* Semantic search using vector embeddings
* Hybrid search combining full-text and vector similarity
* Retrieval-Augmented Generation (RAG) for contextual answers
* PostgreSQL with pgvector for vector storage
* Redis-based queue processing system
* Fully containerized deployment using Docker

---

## System Architecture

```text
Frontend (React)
        ↓
Backend API (ExpressJS + TypeScript)
        ↓
Processing Layer
    - Gmail Sync Service
    - Telegram Sync Service (Python / Telethon)
    - Chunking Service
    - Embedding Service
        ↓
Infrastructure Layer
    - PostgreSQL + pgvector
    - Redis Queue
        ↓
AI Layer
    - Ollama (LLM + Embeddings)
    - RAG Pipeline
```

---

## Prerequisites

Before running the system, ensure the following are installed:

### Docker and Docker Compose

[https://www.docker.com/](https://www.docker.com/)

### Ollama

Install Ollama:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Pull required models:

```bash
ollama pull qwen2.5:3b
ollama pull nomic-embed-text
```

Start Ollama:

```bash
ollama serve
```

---

## API Credentials Setup

### Gmail API Setup

1. Go to Google Cloud Console
2. Create a new project
3. Enable Gmail API
4. Configure OAuth consent screen
5. Create OAuth 2.0 credentials
6. Download client credentials

Required environment variables:

```env
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

---

### Telegram API Setup

1. Go to [https://my.telegram.org](https://my.telegram.org)
2. Log in with your phone number
3. Create a new application under API development tools
4. Retrieve API credentials

Required environment variables:

```env
API_ID=
API_HASH=
PHONE=
```

Notes:

* The phone number must include country code (e.g., +855...)
* Telegram will send a login OTP during first authentication

---

## Installation and Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-repository/context-search.git
cd context-search
```

---

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/context_search
REDIS_URL=redis://redis:6379

OLLAMA_URL=http://host.docker.internal:11434

JWT_SECRET=your_secret_key

GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REDIRECT_URI=http://localhost:3000/auth/google/callback

API_ID=
API_HASH=
PHONE=
```

---

### 3. Start the System

```bash
docker compose up --build
```

This will start:

* Backend API (ExpressJS)
* PostgreSQL with pgvector
* Redis queue system
* Python Telegram sync service
* Worker processes

---

## First-Time Usage

### Gmail Integration

1. Open the application
2. Authenticate using Google OAuth
3. Grant access permissions
4. Email data will be synchronized automatically

---

### Telegram Integration

1. Enter phone number with country code
2. Receive OTP in Telegram app
3. Enter OTP in the system
4. Session is created and stored locally
5. Message synchronization begins automatically

---

## Data Synchronization

### Incremental Sync

The system supports incremental synchronization for both Gmail and Telegram:

* Gmail uses `historyId` tracking
* Telegram uses message ID checkpoints
* Only new messages are fetched on subsequent syncs
* Data is processed asynchronously through a queue system

---

## Search Pipeline

1. User submits natural language query
2. Query is converted into embeddings
3. Hybrid retrieval is performed:

   * Full-text search (PostgreSQL)
   * Vector similarity search (pgvector)
4. Top results are passed into the RAG model
5. Final response is generated using contextual data

---

## AI Models

The system uses Ollama for local model execution.

Recommended models:

* `qwen2.5:3b` (main reasoning model)
* `nomic-embed-text` (embedding model)

---

## Development

### Run backend only

```bash
npm run dev
```

### Run Telegram sync service manually

```bash
cd integration/telegram_service
python main.py
```

---

## Security and Privacy

* All data is processed locally by default
* OAuth credentials are required for external integrations
* Users control access to their connected accounts
* Data can be disconnected or removed at any time
* No data is shared externally unless explicitly configured

---

## Tech Stack

* Backend: Node.js, ExpressJS, TypeScript
* Sync Service: Python (Telethon)
* Database: PostgreSQL + pgvector
* Cache/Queue: Redis, BullMQ
* AI Runtime: Ollama
* Frontend: React

---

## Project Scope

This project is designed for educational and research purposes, demonstrating:

* AI-based communication processing
* Vector database usage
* RAG pipeline architecture
* Hybrid search systems
