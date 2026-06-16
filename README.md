# AI Memory Retrieval Assistant

## Overview

The AI Memory Retrieval Assistant is a local-first, open-source system that enables semantic search and retrieval across personal communication data. It integrates Gmail and Telegram messages into a unified knowledge base using embeddings, hybrid search, and Retrieval-Augmented Generation (RAG).

The system allows users to query their communication history using natural language instead of keyword-based search.

---

## Key Features

* Gmail integration via OAuth 2.0
* Telegram integration using Telethon
* Incremental synchronization for efficient updates
* Semantic search using vector embeddings
* Hybrid search (full-text + vector similarity)
* Retrieval-Augmented Generation (RAG)
* PostgreSQL + pgvector vector database
* Redis-based queue processing
* Fully containerized with Docker

---

## System Architecture

```
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

### Required Software

* Docker & Docker Compose
  [https://www.docker.com/](https://www.docker.com/)

* Ollama
  [https://ollama.com/](https://ollama.com/)

Install:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Models:

```bash
ollama pull qwen2.5:3b
ollama pull nomic-embed-text
```

Start:

```bash
ollama serve
```

---

## API Credentials Setup

This project requires credentials for external integrations.

---

# Gmail Setup (OAuth 2.0)

## 1. Create Google Cloud Project

[https://console.cloud.google.com/](https://console.cloud.google.com/)

## 2. Enable Gmail API

* Go to: APIs & Services → Library
* Enable **Gmail API**

## 3. Configure OAuth Consent Screen

* User Type: External (for testing)
* Add test users (IMPORTANT)

## 4. Create OAuth Credentials

* Go to: APIs & Services → Credentials
* Create OAuth Client ID
* Application type: Web Application

## 5. Add Redirect URI

```
http://localhost:8000/api/integration/google/callback
```

## Required Environment Variables

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/api/integration/google/callback
```

---

# ⚠️ Adding Gmail Test Users

If your app is in “Testing mode”:

Go to:

**Google Cloud Console → OAuth consent screen → Test Users**

Add emails manually or OAuth will FAIL for other accounts.

---

# Telegram API Setup

## 1. Create Telegram App

[https://my.telegram.org](https://my.telegram.org)

## 2. Login with your phone number

## 3. Go to:

**API Development Tools**

## 4. Create a new application

You will receive:

* API_ID
* API_HASH

## Required Environment Variables

```env
TELEGRAM_API_ID=
TELEGRAM_API_HASH=
PHONE=
```

---

## Telegram Notes

* Phone number must include country code (e.g. +855…)
* First login requires OTP sent via Telegram app
* Session is stored locally after authentication

---

## Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-repository/context-search.git
cd context-search
```

---

### 2. Configure Environment

Create `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/context_search
REDIS_URL=redis://redis:6379

OLLAMA_URL=http://host.docker.internal:11434

JWT_SECRET=your_secret_key

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/api/integration/google/callback

TELEGRAM_API_ID=
TELEGRAM_API_HASH=
PHONE=
```

---

### 3. Start System

```bash
docker compose up --build
```

This starts:

* Backend API (ExpressJS)
* PostgreSQL + pgvector
* Redis queue
* Telegram sync worker (Python)
* Background processors

---

## First-Time Usage

### Gmail

1. Login with Google OAuth
2. Grant permissions
3. Emails sync automatically

---

### Telegram

1. Enter phone number
2. Receive OTP in Telegram app
3. Authenticate session
4. Messages sync automatically

---

## Data Synchronization

### Incremental Sync System

* Gmail: uses `historyId`
* Telegram: uses `chatStates + message_id checkpoints`
* Only new messages are fetched after initial sync
* Processing happens via queue workers

---

## Search Pipeline

1. User sends query
2. Query is embedded into vector space
3. Hybrid retrieval:

   * Full-text search (Postgres FTS)
   * Vector similarity (pgvector)
4. Results ranked using hybrid scoring
5. RAG model generates final answer

---

## AI Models (Ollama)

Recommended models:

* `qwen2.5:3b` → reasoning + response generation
* `nomic-embed-text` → embeddings

---

## Development

### Run backend only

```bash
npm run dev
```

### Run Telegram sync manually

```bash
cd integration/telegram_service
python main.py
```

---

## Security & Privacy

* All processing is local-first by default
* OAuth tokens stored securely
* Telegram sessions stored locally
* Users fully control integrations
* No external data sharing unless configured

---

## Tech Stack

* Backend: Node.js, ExpressJS, TypeScript
* Sync Service: Python (Telethon)
* Database: PostgreSQL + pgvector
* Cache/Queue: Redis / BullMQ
* AI Runtime: Ollama
* Frontend: React

---

## Project Scope

This project demonstrates:

* AI-powered personal data retrieval
* Vector database design (pgvector)
* Hybrid search systems
* RAG pipelines
* Multi-source data integration (Gmail + Telegram)
