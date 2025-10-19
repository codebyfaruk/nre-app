# Makefile

# Default values
DC=docker compose
APP_NAME=app

# Start containers in detached mode
up:
	$(DC) up -d

# Build containers
build:
	$(DC) build --no-cache

# Build containers
buildup:
	$(DC) up --build

# Stop and remove containers, networks, and volumes
down:
	$(DC) down

# Access bash inside the app container
bash:
	$(DC) exec $(APP_NAME) bash

# Tail logs for all containers
logs:
	$(DC) logs -f
