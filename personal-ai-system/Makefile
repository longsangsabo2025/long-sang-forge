.PHONY: help install setup dev test clean docker-build docker-up docker-down logs format lint

help:
	@echo "Personal AI Agent System - Makefile Commands"
	@echo ""
	@echo "Setup & Installation:"
	@echo "  make install       - Install Python dependencies"
	@echo "  make setup         - Initial setup (copy .env, create dirs)"
	@echo "  make dev           - Setup development environment"
	@echo ""
	@echo "Development:"
	@echo "  make run           - Run the CLI application"
	@echo "  make api           - Run the API server"
	@echo "  make test          - Run tests"
	@echo "  make format        - Format code with black"
	@echo "  make lint          - Lint code with ruff"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-build  - Build Docker images"
	@echo "  make docker-up     - Start all services"
	@echo "  make docker-down   - Stop all services"
	@echo "  make logs          - View logs"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean         - Clean temporary files"

install:
	pip install -r requirements.txt

setup:
	@if not exist .env copy .env.example .env
	@if not exist logs mkdir logs
	@if not exist user_data mkdir user_data
	@if not exist memory_data mkdir memory_data
	@echo Setup complete! Please edit .env file with your API keys.

dev: install setup
	pip install black ruff mypy pytest pytest-asyncio pytest-cov
	@echo Development environment ready!

run:
	python -m cli.main

api:
	uvicorn api.main:app --reload --host 0.0.0.0 --port 8000

test:
	pytest tests/ -v --cov=. --cov-report=html

format:
	black .
	ruff check --fix .

lint:
	ruff check .
	mypy .

docker-build:
	docker-compose build

docker-up:
	docker-compose up -d
	@echo Services started! Access:
	@echo - API: http://localhost:8001
	@echo - Qdrant: http://localhost:6333
	@echo - Redis: localhost:6379

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

logs:
	@if exist logs\app.log type logs\app.log

clean:
	@if exist __pycache__ rmdir /s /q __pycache__
	@if exist .pytest_cache rmdir /s /q .pytest_cache
	@if exist .coverage del .coverage
	@if exist htmlcov rmdir /s /q htmlcov
	@for /r %%i in (*.pyc) do @del "%%i"
	@for /r %%i in (__pycache__) do @if exist "%%i" rmdir /s /q "%%i"
	@echo Cleanup complete!
