# 🧠 Hybrid Brain Architecture

## Overview

Long Sang Portfolio sử dụng **Hybrid Brain Architecture** - kết hợp sức mạnh của Cloud Brain (Supabase + OpenAI) và Local Brain (LEANN) để mang lại trải nghiệm AI tốt nhất.

```
┌─────────────────────────────────────────────────────────────┐
│                    USER REQUEST                              │
│                         │                                    │
│              ┌──────────▼──────────┐                        │
│              │   Hybrid Router     │                        │
│              │   (Smart Routing)   │                        │
│              └──────────┬──────────┘                        │
│                         │                                    │
│         ┌───────────────┼───────────────┐                   │
│         ▼               ▼               ▼                   │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐               │
│   │  Cloud   │   │  Local   │   │  Hybrid  │               │
│   │ Supabase │   │  LEANN   │   │  Merge   │               │
│   │+pgvector │   │          │   │          │               │
│   └──────────┘   └──────────┘   └──────────┘               │
│         │               │               │                   │
│         └───────────────┼───────────────┘                   │
│                         ▼                                    │
│                   RESPONSE                                   │
└─────────────────────────────────────────────────────────────┘
```

## 🌥️ Cloud Brain (Supabase + OpenAI)

**Ưu điểm:**

- ✅ Multi-user support với Row Level Security (RLS)
- ✅ Realtime sync across devices
- ✅ High-quality embeddings (text-embedding-3-small)
- ✅ Powerful GPT-4o-mini for chat
- ✅ Scalable infrastructure

**Use cases:**

- Production web app
- Shared knowledge base
- Team collaboration
- Public-facing AI assistant

## 🏠 Local Brain (LEANN)

**Ưu điểm:**

- ✅ 100% private - data never leaves your machine
- ✅ 97% storage savings với graph-based index
- ✅ Works offline
- ✅ Fast local search
- ✅ No API costs for local search

**Use cases:**

- Personal notes & journals
- Private chat history
- Local development
- Code search
- Offline mode

## 🔀 Hybrid Mode

Hybrid mode kết hợp cả hai brain để tận dụng ưu điểm của mỗi bên:

### Routing Logic

```javascript
// Automatic routing based on context
function determineMode(options) {
  // 1. Explicit override
  if (options.brainMode) return options.brainMode;

  // 2. Private request → Local
  if (options.privateOnly) return "local";

  // 3. LEANN not available → Cloud
  if (!leannAvailable) return "cloud";

  // 4. Domain-based routing
  if (options.domain === "personal") return "local";
  if (options.domain === "shared") return "cloud";

  // 5. Default: Hybrid
  return "hybrid";
}
```

### Priority Modes

| Mode          | Description                     |
| ------------- | ------------------------------- |
| `cloud-first` | Cloud results first, then local |
| `local-first` | Local results first, then cloud |
| `merge`       | Interleave by similarity score  |

## 📡 API Endpoints

### Cloud Brain

```
GET  /api/brain/domains              - List domains
POST /api/brain/knowledge/search     - Search cloud
POST /api/brain/knowledge            - Add to cloud
```

### Local Brain (LEANN)

```
GET  /api/brain/leann/status         - Check status
POST /api/brain/leann/init           - Initialize index
POST /api/brain/leann/add            - Add content
POST /api/brain/leann/search         - Search local
POST /api/brain/leann/chat           - Chat with local RAG
GET  /api/brain/leann/indexes        - List indexes
```

### Hybrid Brain

```
GET  /api/brain/hybrid/status        - Check both brains
POST /api/brain/hybrid/search        - Search across both
POST /api/brain/hybrid/ingest        - Add to appropriate brain
POST /api/brain/hybrid/chat          - Chat with hybrid RAG
```

## ⚙️ Configuration

Add to `.env`:

```env
# LEANN Configuration
LEANN_ENABLED=true
LEANN_INDEX_PATH=./data/leann
LEANN_PYTHON=python
LEANN_DEFAULT_INDEX=long-sang-brain

# Hybrid Configuration
BRAIN_MODE=hybrid
BRAIN_HYBRID_PRIORITY=cloud-first
BRAIN_MERGE_THRESHOLD=0.6
BRAIN_MAX_RESULTS_PER_SOURCE=5
```

## 🚀 Setup Guide

### 1. Install LEANN

```bash
# Using pip
pip install leann

# Or using uv (faster)
uv pip install leann
```

### 2. Run Setup Script

```bash
python scripts/setup-leann.py
```

### 3. Enable in .env

```env
LEANN_ENABLED=true
```

### 4. Restart Server

```bash
npm run dev
```

### 5. Verify Status

```bash
curl http://localhost:3001/api/brain/hybrid/status
```

## 📊 Comparison

| Feature    | Cloud Brain      | Local Brain   | Hybrid          |
| ---------- | ---------------- | ------------- | --------------- |
| Privacy    | ⚠️ Data on cloud | ✅ 100% local | ✅ Best of both |
| Cost       | 💰 API calls     | ✅ Free       | 💰 Reduced      |
| Speed      | ⚡ Fast          | ⚡⚡ Faster   | ⚡ Balanced     |
| Offline    | ❌ No            | ✅ Yes        | ⚠️ Partial      |
| Multi-user | ✅ Yes           | ❌ No         | ⚠️ Partial      |
| Storage    | 📦 Server        | 📦 97% less   | 📦 Optimized    |
| Quality    | ⭐⭐⭐⭐⭐       | ⭐⭐⭐⭐      | ⭐⭐⭐⭐⭐      |

## 🔒 Security Recommendations

1. **Sensitive Data** → Use `privateOnly: true` or `brainMode: 'local'`
2. **Public Data** → Use cloud for better sharing and sync
3. **Mixed Data** → Use hybrid mode with domain-based routing
4. **API Keys** → Never store in local index metadata

## 🛠️ Troubleshooting

### LEANN not detected

```bash
# Check Python installation
python --version

# Reinstall LEANN
pip uninstall leann
pip install leann
```

### Index not found

```bash
# Check index directory
ls ./data/leann/

# Reinitialize
python scripts/setup-leann.py
```

### Hybrid not working

```bash
# Check status
curl http://localhost:3001/api/brain/hybrid/status

# Check both brains
curl http://localhost:3001/api/brain/leann/status
```

## 📚 References

- [LEANN GitHub](https://github.com/yichuan-w/LEANN)
- [Supabase Vector](https://supabase.com/docs/guides/ai/vector-columns)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
