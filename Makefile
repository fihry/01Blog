.PHONY: help env-check db storage app compose status

include .env
export

# --------------------------
# Help
# --------------------------
help:
	@echo "01Blog Makefile Commands:"
	@echo ""
	@echo "  Database:"
	@echo "    make db-up       - Start PostgreSQL"
	@echo "    make db-down     - Stop PostgreSQL"
	@echo "    make db-logs     - Show DB logs"
	@echo "    make db-shell    - Connect to DB shell"
	@echo ""
	@echo "  Storage (Alarik):"
	@echo "    make storage-up    - Start Alarik storage"
	@echo "    make storage-down  - Stop Alarik storage"
	@echo "    make storage-logs  - Show storage logs"
	@echo ""
	@echo "  App:"
	@echo "    make run         - Run backend locally"
	@echo "    make build       - Build backend"
	@echo "    make clean       - Clean build"
	@echo "    make test        - Run tests"
	@echo ""
	@echo "  Docker Compose Stack:"
	@echo "    make compose-up      - Start all containers"
	@echo "    make compose-down    - Stop all containers"
	@echo "    make compose-logs    - View logs"
	@echo "    make compose-restart - Restart all containers"
	@echo ""
	@echo "  Utility:"
	@echo "    make env-check   - Check environment variables"
	@echo "    make status      - Check system status"

# --------------------------
# Environment check
# --------------------------
env-check:
	@echo "=== Environment Check ==="
	@echo "DB_HOST: $(DB_HOST)"
	@echo "DB_PORT: $(DB_PORT)"
	@echo "DB_NAME: $(DB_NAME)"
	@echo "DB_USER: $(DB_USER)"
	@echo "BACKEND_PORT: $(BACKEND_PORT)"
	@echo "FRONTEND_PORT: $(FRONTEND_PORT)"
	@echo "STORAGE_PORT: 9000"
	@echo "JWT_SECRET: $$(echo $(JWT_SECRET) | cut -c1-10)..."
	@echo "JWT_EXPIRATION": $(JWT_EXPIRATION)

# --------------------------
# Docker Compose stack
# --------------------------
compose-up:
	@echo "🚀 Starting 01Blog stack..."
	docker compose up -d --build
	@echo "✅ Stack started!"

compose-down:
	@echo "🛑 Stopping 01Blog stack..."
	docker compose down
	@echo "✅ Stack stopped!"

compose-logs:
	docker compose logs -f

compose-restart: compose-down compose-up
	@echo "🔄 Stack restarted!"

# --------------------------
# Database commands
# --------------------------
db-up:
	docker compose up -d db

db-down:
	docker compose stop db && docker compose rm -f db

db-logs:
	docker compose logs -f db

db-shell:
	docker compose exec db psql -U $(DB_USER) -d $(DB_NAME)

# --------------------------
# Storage (Alarik) commands
# --------------------------
storage-up:
	@echo "🚀 Starting Alarik storage..."
	docker compose up -d storage
	@echo "✅ Storage started!"

storage-down:
	@echo "🛑 Stopping Alarik storage..."
	docker compose stop storage && docker compose rm -f storage
	@echo "✅ Storage stopped!"

storage-logs:
	docker compose logs -f storage

# --------------------------
# Backend app commands
# --------------------------
run:
	mvn -f backend/pom.xml spring-boot:run

build:
	mvn -f backend/pom.xml clean compile

clean:
	mvn -f backend/pom.xml clean

test:
	mvn -f backend/pom.xml test

# --------------------------
# Status
# --------------------------
status: env-check
	@echo "=== System Status ==="
	@docker ps --filter "name=db" --format "PostgreSQL: {{.Status}}"
	@docker ps --filter "name=storage" --format "Storage: {{.Status}}"
	@docker ps --filter "name=backend" --format "Backend: {{.Status}}"
	@docker ps --filter "name=frontend" --format "Frontend: {{.Status}}"
