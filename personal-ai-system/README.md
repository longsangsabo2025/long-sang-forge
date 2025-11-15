# Personal AI Agent System

Hệ thống AI Agent đa năng phục vụ công việc và cuộc sống cá nhân.

## 🎯 Tính năng

- **Multi-Agent Architecture**: Hệ thống agents chuyên biệt cho từng lĩnh vực
- **Intelligent Orchestration**: Điều phối thông minh giữa các agents
- **Memory System**: Ghi nhớ ngữ cảnh và học từ tương tác
- **Tool Integration**: Tích hợp với email, calendar, task management, web search...
- **Proactive Assistance**: Đề xuất và hành động chủ động

## 🏗️ Kiến trúc

```
personal-ai-system/
├── agents/              # Các specialized agents
├── core/                # Core system components
├── memory/              # Memory & knowledge management
├── tools/               # External integrations
├── orchestrator/        # Agent orchestration logic
├── api/                 # REST API endpoints
├── cli/                 # Command-line interface
└── config/              # Configuration files
```

## 🚀 Quick Start

### 1. Cài đặt dependencies
```bash
pip install -r requirements.txt
```

### 2. Setup environment
```bash
cp .env.example .env
# Chỉnh sửa .env với API keys của bạn
```

### 3. Chạy hệ thống
```bash
python cli/main.py
```

## 📦 Tech Stack

- **LangGraph**: Stateful agent workflows
- **LangChain**: LLM integration & tools
- **Qdrant**: Vector database cho memory
- **Redis**: Caching & message queue
- **FastAPI**: REST API
- **Rich**: Beautiful CLI interface

## 🔧 Configuration

Xem file `config/settings.yaml` để cấu hình hệ thống.

## 📝 License

MIT License
