# 🚀 Quick Start Guide

Hướng dẫn nhanh để khởi động Personal AI Agent System.

## 📋 Yêu cầu hệ thống

- **Python**: 3.11 trở lên
- **Docker** (optional): Để chạy Qdrant và Redis
- **API Keys**: OpenAI, Anthropic, hoặc Google AI

## ⚡ Cài đặt nhanh

### 1. Clone và setup

```bash
cd personal-ai-system

# Tạo virtual environment
python -m venv venv

# Activate venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt
```

### 2. Cấu hình môi trường

```bash
# Copy file .env mẫu
copy .env.example .env

# Chỉnh sửa .env với API keys của bạn
notepad .env
```

**Tối thiểu cần:**
```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...
```

### 3. Khởi động services (Docker)

```bash
# Start Qdrant và Redis
docker-compose up -d qdrant redis

# Kiểm tra services đang chạy
docker-compose ps
```

**Hoặc không dùng Docker:**
- Qdrant: Download từ https://qdrant.tech/
- Redis: Download từ https://redis.io/

### 4. Chạy hệ thống

#### Option A: CLI Interactive Mode

```bash
python -m cli.main interactive
```

Sau đó bạn có thể chat với AI assistant:
```
You: Help me write an email to schedule a meeting
🤖 Assistant: [AI sẽ giúp bạn soạn email...]

You: Remind me to exercise tomorrow at 7am
🤖 Assistant: [AI sẽ tạo reminder...]
```

#### Option B: Single Query

```bash
python -m cli.main query "Search for latest AI trends"
```

#### Option C: API Server

```bash
# Start API server
uvicorn api.main:app --reload

# Truy cập docs tại: http://localhost:8000/docs
```

Test API với curl:
```bash
curl -X POST http://localhost:8000/task \
  -H "Content-Type: application/json" \
  -d '{"task": "Help me plan my week"}'
```

## 🎯 Ví dụ sử dụng

### Work Tasks

```bash
# Email management
python -m cli.main query "Draft an email to John about project update"

# Task management
python -m cli.main query "Create a task list for my presentation"

# Meeting prep
python -m cli.main query "Help me prepare for tomorrow's client meeting"
```

### Life Tasks

```bash
# Calendar
python -m cli.main query "Schedule dentist appointment next Tuesday 2pm"

# Reminders
python -m cli.main query "Remind me to call mom this weekend"

# Planning
python -m cli.main query "Plan my workout routine for this week"
```

### Research Tasks

```bash
# Web search
python -m cli.main query "Find latest developments in AI agents"

# Information gathering
python -m cli.main query "Summarize recent papers on LangGraph"

# Analysis
python -m cli.main query "Compare different vector databases"
```

## 🔧 Troubleshooting

### Lỗi: "Redis connection failed"
```bash
# Kiểm tra Redis đang chạy
docker-compose ps redis

# Restart Redis
docker-compose restart redis
```

### Lỗi: "Qdrant collection not found"
```bash
# Qdrant sẽ tự tạo collection lần đầu chạy
# Nếu lỗi, restart Qdrant:
docker-compose restart qdrant
```

### Lỗi: "API key not found"
```bash
# Kiểm tra .env file có đúng API keys
cat .env | grep API_KEY

# Đảm bảo .env file ở đúng thư mục
```

## 📊 Kiểm tra hệ thống

```bash
# Check configuration
python -m cli.main config

# Check version
python -m cli.main version

# Run tests
pytest tests/ -v
```

## 🐳 Docker Compose (Full Stack)

```bash
# Start tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services available:
- **AI Agent**: http://localhost:8000
- **API Server**: http://localhost:8001
- **Qdrant**: http://localhost:6333
- **Redis**: localhost:6379

## 📖 Tiếp theo

- Đọc [Architecture Guide](./ARCHITECTURE.md) để hiểu cách hệ thống hoạt động
- Xem [API Documentation](http://localhost:8000/docs) khi API server đang chạy
- Tùy chỉnh agents trong `config/settings.yaml`
- Thêm custom tools trong `tools/`

## 💡 Tips

1. **Memory System**: Hệ thống tự động ghi nhớ context từ các lần tương tác trước
2. **Agent Routing**: Orchestrator tự động chọn agent phù hợp dựa trên task
3. **Streaming**: Enable streaming trong config để nhận response real-time
4. **Monitoring**: Dùng LangSmith để monitor agent behavior (cần LANGCHAIN_API_KEY)

## 🆘 Cần trợ giúp?

- Check logs: `logs/app.log`
- Xem [FAQ](./FAQ.md)
- GitHub Issues: [Create issue](https://github.com/yourrepo/issues)
