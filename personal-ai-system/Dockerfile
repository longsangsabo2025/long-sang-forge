# Multi-stage build for Python AI Agent System

FROM python:3.11-slim as base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p logs user_data memory_data

# Expose ports
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Default command
CMD ["python", "-m", "cli.main"]


# Development stage
FROM base as development

# Install development dependencies
RUN pip install --no-cache-dir black ruff mypy pytest pytest-asyncio pytest-cov ipython

# Enable hot-reload
ENV PYTHONUNBUFFERED=1
ENV ENVIRONMENT=development

CMD ["python", "-m", "cli.main"]


# Production stage
FROM base as production

# Use non-root user
RUN useradd -m -u 1000 aiuser && \
    chown -R aiuser:aiuser /app

USER aiuser

ENV ENVIRONMENT=production
ENV PYTHONOPTIMIZE=1

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
