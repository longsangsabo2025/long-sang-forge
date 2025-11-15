# 🏗️ System Architecture

Tài liệu về kiến trúc của Personal AI Agent System.

## 📐 Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
│                  (CLI / REST API / Web UI)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   Orchestrator Agent                         │
│              (Task Routing & Coordination)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┬──────────────┐
         │               │               │              │
┌────────▼─────┐  ┌─────▼──────┐  ┌────▼──────┐  ┌───▼───────┐
│ Work Agent   │  │ Life Agent │  │  Research │  │  Future   │
│              │  │            │  │   Agent   │  │  Agents   │
│ • Email      │  │ • Calendar │  │ • Web     │  │ • Finance │
│ • Tasks      │  │ • Reminders│  │   Search  │  │ • Learning│
│ • Meetings   │  │ • Planning │  │ • Analysis│  │ • Custom  │
└────────┬─────┘  └─────┬──────┘  └────┬──────┘  └───┬───────┘
         │               │               │              │
         └───────────────┼───────────────┴──────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                      Core Services                           │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────────┐ │
│  │   LangGraph  │  │ Memory System │  │  Tool Registry  │ │
│  │   Workflow   │  │  (Qdrant +    │  │  (Integrations) │ │
│  │   Engine     │  │   Redis)      │  │                 │ │
│  └──────────────┘  └───────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   External Services                          │
│  • LLM APIs (OpenAI, Anthropic, Google)                     │
│  • Vector DB (Qdrant)                                       │
│  • Cache (Redis)                                            │
│  • External APIs (Gmail, Calendar, Jira, etc.)             │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Core Components

### 1. Orchestrator Layer

**File**: `agents/orchestrator.py`

**Nhiệm vụ**:
- Phân tích user request
- Route đến agent phù hợp
- Điều phối multi-agent collaboration
- Tổng hợp responses

**Quy trình routing**:
```python
User Request
    ↓
Analyze keywords & context
    ↓
Determine task type
    ↓
Select specialized agent
    ↓
Forward to agent
```

### 2. Specialized Agents

#### Work Agent (`agents/work_agent.py`)
- **Model**: GPT-4o
- **Capabilities**: Email, tasks, meetings, documents, code
- **Use cases**: Productivity, project management

#### Life Agent (`agents/life_agent.py`)
- **Model**: GPT-4o-mini (fast)
- **Capabilities**: Calendar, reminders, health, planning
- **Use cases**: Personal organization, lifestyle

#### Research Agent (`agents/research_agent.py`)
- **Model**: Claude 3.5 Sonnet (reasoning)
- **Capabilities**: Web search, analysis, synthesis
- **Use cases**: Information gathering, research

### 3. LangGraph Workflow Engine

**File**: `core/agent_graph.py`

**State Management**:
```python
AgentState = {
    "messages": List[Message],
    "task": str,
    "task_type": str,
    "current_agent": str,
    "next_agent": str,
    "agent_outputs": Dict,
    "final_response": str,
    "metadata": Dict,
    "error": Optional[str],
    "iteration": int
}
```

**Workflow Pattern**:
```
START
  ↓
Orchestrator (analyze & route)
  ↓
[Conditional routing]
  ├→ Work Agent → Process → Return result
  ├→ Life Agent → Process → Return result
  └→ Research Agent → Process → Return result
  ↓
END
```

### 4. Memory System

**Architecture**:

```
┌─────────────────────────────────────┐
│        Memory Manager               │
└────────┬────────────────┬───────────┘
         │                │
    ┌────▼────┐      ┌───▼──────┐
    │ Redis   │      │  Qdrant  │
    │ (Cache) │      │ (Vector) │
    └─────────┘      └──────────┘
```

**Short-term Memory** (Redis):
- **TTL**: 24 hours
- **Use**: Recent conversations, temp data
- **Format**: JSON key-value

**Long-term Memory** (Qdrant):
- **Storage**: Vector embeddings
- **Use**: Knowledge base, context
- **Search**: Semantic similarity

### 5. Tool Integration

**File**: `core/tool_registry.py`

**Available Tools**:
```python
{
    "web_search": DuckDuckGo search,
    "send_email": Gmail SMTP,
    "create_calendar_event": Google Calendar,
    "manage_tasks": Todoist/Jira/Asana,
    # Extensible...
}
```

**Tool Registration**:
```python
registry = ToolRegistry()
registry.register_tool(
    name="web_search",
    func=search_web,
    description="Search the web",
    category="research"
)
```

## 🔄 Data Flow

### Typical Request Flow:

```
1. User Input
   └─→ CLI/API receives request

2. Workflow Initialization
   └─→ Create initial AgentState
   
3. Orchestrator Analysis
   └─→ Analyze task
   └─→ Retrieve memory context
   └─→ Determine routing
   
4. Agent Processing
   └─→ Specialized agent receives task
   └─→ Agent uses LLM + tools
   └─→ Store interaction in memory
   
5. Response Generation
   └─→ Format response
   └─→ Update state
   └─→ Return to user

6. Memory Storage
   └─→ Store in vector DB
   └─→ Cache in Redis
```

## 🧠 LLM Strategy

### Provider Selection:

| Task Type | Provider | Model | Reasoning |
|-----------|----------|-------|-----------|
| Complex reasoning | Anthropic | Claude 3.5 Sonnet | Best reasoning capability |
| General tasks | OpenAI | GPT-4o | Balanced performance |
| Fast responses | OpenAI | GPT-4o-mini | Speed & cost |
| Embeddings | OpenAI | text-embedding-3-small | Quality & cost |

### Fallback Strategy:

```python
Primary: Anthropic Claude
    ↓ (if fails)
Fallback: OpenAI GPT-4o
    ↓ (if fails)
Last resort: Google Gemini
```

## 📊 State Management

### LangGraph State Flow:

```python
# Initial state
state = {
    "task": "Help me write an email",
    "iteration": 0
}

# After orchestrator
state = {
    "task": "Help me write an email",
    "task_type": "work",
    "next_agent": "work_agent",
    "iteration": 1
}

# After agent processing
state = {
    "task": "Help me write an email",
    "task_type": "work",
    "current_agent": "work_agent",
    "final_response": "Here's a draft email...",
    "iteration": 1
}
```

## 🔐 Security Considerations

1. **API Keys**: Stored in `.env`, never committed
2. **PII Detection**: Enabled in config, redacts sensitive data
3. **Rate Limiting**: Configurable per-minute limits
4. **Data Encryption**: AES-256 for stored data
5. **Access Control**: To be implemented in production

## 📈 Scalability

### Current Design:
- **Single process**: Suitable for personal use
- **Async operations**: Non-blocking I/O
- **Stateless API**: Can be horizontally scaled

### Future Enhancements:
- **Celery workers**: For background tasks
- **Load balancer**: Multiple API instances
- **Distributed tracing**: OpenTelemetry
- **Message queue**: For agent communication

## 🔌 Extension Points

### Adding New Agents:

```python
# 1. Create agent class
class FinanceAgent(BaseAgent):
    def _default_system_prompt(self):
        return "You are a financial advisor..."
    
    async def process(self, input_data):
        # Implementation
        pass

# 2. Register with workflow
workflow.register_agent("finance_agent", FinanceAgent())

# 3. Update orchestrator routing
```

### Adding New Tools:

```python
# 1. Create tool function
def custom_tool(param: str) -> str:
    # Implementation
    pass

# 2. Register tool
registry = get_tool_registry()
registry.register_tool(
    name="custom_tool",
    func=custom_tool,
    description="Does something custom",
    category="custom"
)
```

## 📝 Configuration

**Main config**: `config/settings.yaml`

Key settings:
- **LLM providers**: Primary & fallback
- **Agent capabilities**: Enable/disable features
- **Memory settings**: TTL, retention
- **Tool configurations**: API endpoints, credentials

## 🔍 Monitoring & Observability

### Logging:
- **Library**: Loguru
- **Levels**: DEBUG, INFO, WARNING, ERROR
- **Output**: Console + file (`logs/app.log`)

### Tracing (Optional):
- **LangSmith**: LLM call tracing
- **Prometheus**: Metrics collection
- **Grafana**: Visualization

### Metrics:
- Request count
- Response time
- Agent utilization
- Error rate
- Memory usage

## 🧪 Testing Strategy

### Unit Tests:
- Individual agents
- Memory operations
- Tool functions

### Integration Tests:
- Workflow execution
- Multi-agent collaboration
- External API integration

### Performance Tests:
- Response time
- Concurrent requests
- Memory usage

## 🚀 Deployment

See `docker-compose.yml` for containerized deployment:

```bash
docker-compose up -d
```

Services:
- **ai-agent**: Main application
- **api-server**: REST API
- **qdrant**: Vector database
- **redis**: Cache
- **prometheus** (optional): Monitoring
- **grafana** (optional): Dashboards
