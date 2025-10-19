FROM python:3.12-slim

WORKDIR /app

# System dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential curl git libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Poetry installation
ENV POETRY_HOME="/opt/poetry" \
    POETRY_NO_INTERACTION=1 \
    PATH="/opt/poetry/bin:${PATH}"

RUN curl -sSL https://install.python-poetry.org | python3 -

# Copy project metadata for caching
COPY pyproject.toml poetry.lock* /app/

RUN poetry config virtualenvs.create false \
 && poetry install --no-interaction --no-ansi --no-root

# Copy source code
COPY ./src /app/src

# Create logs directory
RUN mkdir -p /app/logs \
    && useradd -m appuser \
    && chown -R appuser:appuser /app/logs

USER appuser

# Expose port
EXPOSE 8000

# Start FastAPI automatically
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
