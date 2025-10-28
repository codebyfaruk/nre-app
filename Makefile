# Makefile

# Default values
DC=docker compose
APP_NAME=app
msg=



# Start containers in detached mode
up:
	$(DC) up -d

# Build containers
build:
	$(DC) build $(msg)

# Build containers
buildup:
	$(DC) up --build

# Stop and remove containers, networks, and volumes
down:
	$(DC) down

# Create a new Alembic migration
migrations:
	alembic revision --autogenerate -m "$(msg)"

# Apply Alembic migrations
migrate:
	alembic upgrade head

# Rollback the last Alembic migration
rollback:
	alembic downgrade -1

# Access bash inside the app container
bash:
	$(DC) exec $(APP_NAME) bash

# Tail logs for all containers
logview:
	$(DC) logs -f

runapp:
	uvicorn src.main:app --host "0.0.0.0" --port 8000 --reload

prune:
	docker system prune --volumes

seeder:
	$(DC) exec $(APP_NAME) python -m src.seeders.seed