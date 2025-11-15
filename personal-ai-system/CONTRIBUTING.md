# 🤝 Contributing Guide

Cảm ơn bạn quan tâm đến việc đóng góp cho Personal AI Agent System!

## Setup Development Environment

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install black ruff mypy pytest pytest-asyncio
```

## Code Style

- Follow PEP 8
- Use type hints
- Max line length: 100
- Use async/await for I/O

## Testing

```bash
pytest tests/ -v --cov=.
```

## Pull Request Process

1. Fork & clone repo
2. Create feature branch
3. Make changes with tests
4. Format code: `black .`
5. Run tests
6. Submit PR

## Commit Messages

- `feat:` New feature
- `fix:` Bug fix  
- `docs:` Documentation
- `test:` Tests

## Areas to Contribute

- New agents (Finance, Learning)
- Tool integrations (Gmail, Calendar)
- Documentation & examples
- Performance improvements
