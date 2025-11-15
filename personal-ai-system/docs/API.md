# 📡 API Documentation

REST API reference cho Personal AI Agent System.

## Base URL

```
http://localhost:8000
```

## Authentication

Hiện tại chưa có authentication. Sẽ implement trong production.

## Endpoints

### 🏠 Root

```http
GET /
```

**Response:**
```json
{
  "message": "Personal AI Assistant API",
  "version": "0.1.0",
  "docs": "/docs"
}
```

---

### ❤️ Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "agents": {
    "work_agent": true,
    "life_agent": true,
    "research_agent": true
  }
}
```

---

### 📋 Execute Task

```http
POST /task
```

**Request Body:**
```json
{
  "task": "Help me write an email to schedule a meeting",
  "agent": null,
  "metadata": {
    "priority": "high",
    "context": "Follow-up from last discussion"
  }
}
```

**Parameters:**
- `task` (string, required): Task description
- `agent` (string, optional): Specific agent to use (`work_agent`, `life_agent`, `research_agent`)
- `metadata` (object, optional): Additional context

**Response:**
```json
{
  "success": true,
  "response": "Here's a draft email for your meeting...",
  "agent": "work_agent",
  "task_type": "work",
  "error": null,
  "iterations": 1
}
```

**Error Response:**
```json
{
  "success": false,
  "response": null,
  "error": "Error message here",
  "iterations": 1
}
```

---

### 🤖 List Agents

```http
GET /agents
```

**Response:**
```json
{
  "agents": [
    "work_agent",
    "life_agent",
    "research_agent"
  ],
  "count": 3
}
```

---

### ⚙️ Get Configuration

```http
GET /config
```

**Response:**
```json
{
  "system": {
    "name": "Personal AI Assistant",
    "version": "0.1.0",
    "environment": "development"
  },
  "llm": {
    "primary_provider": "anthropic",
    "fallback_provider": "openai"
  },
  "agents": {
    "work_agent": {
      "enabled": true,
      "model": "gpt-4o"
    },
    "life_agent": {
      "enabled": true,
      "model": "gpt-4o-mini"
    }
  }
}
```

---

## Example Usage

### cURL

```bash
# Health check
curl http://localhost:8000/health

# Execute task
curl -X POST http://localhost:8000/task \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Search for latest AI agent frameworks",
    "metadata": {"source": "api"}
  }'

# List agents
curl http://localhost:8000/agents
```

### Python (requests)

```python
import requests

# Execute task
response = requests.post(
    "http://localhost:8000/task",
    json={
        "task": "Remind me to call John tomorrow at 10am",
        "metadata": {"priority": "high"}
    }
)

result = response.json()
print(result["response"])
```

### JavaScript (fetch)

```javascript
// Execute task
const response = await fetch('http://localhost:8000/task', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    task: 'Help me plan my week',
    metadata: { context: 'work planning' }
  })
});

const result = await response.json();
console.log(result.response);
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (invalid input) |
| 500 | Internal Server Error |
| 503 | Service Unavailable (system not initialized) |

---

## Rate Limiting

Current: **60 requests per minute**

Configurable in `config/settings.yaml`:
```yaml
security:
  rate_limiting:
    enabled: true
    max_requests_per_minute: 60
```

---

## Interactive Documentation

FastAPI provides interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

These interfaces allow you to:
- Explore all endpoints
- Test API calls directly
- View request/response schemas
- See example payloads

---

## WebSocket Support (Coming Soon)

```javascript
// Future implementation
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onmessage = (event) => {
  const response = JSON.parse(event.data);
  console.log(response);
};

ws.send(JSON.stringify({
  task: "Continuous monitoring task"
}));
```

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": "Detailed error message",
  "error_type": "ValueError",
  "timestamp": "2025-01-17T10:30:00Z"
}
```

Common errors:
- **Invalid task**: Empty or malformed task string
- **Agent not found**: Specified agent doesn't exist
- **LLM error**: API key issue or rate limit
- **Memory error**: Database connection failed

---

## Best Practices

1. **Include metadata**: Helps with context and debugging
2. **Handle errors gracefully**: Check `success` field
3. **Use appropriate agents**: Specify agent when you know the task type
4. **Monitor rate limits**: Implement backoff strategy
5. **Cache responses**: For repeated queries

---

## SDK (Coming Soon)

```python
from personal_ai import Client

client = Client(base_url="http://localhost:8000")

# Simple usage
response = client.task("Help me write an email")
print(response.text)

# With options
response = client.task(
    "Search for AI trends",
    agent="research_agent",
    metadata={"depth": "detailed"}
)
```
