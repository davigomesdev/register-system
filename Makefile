# =============================================================================
# Makefile — register-system
# =============================================================================

# Each stack reads its own env file via --env-file (no shell export needed).
COMPOSE      := docker compose --env-file .env.example     -f docker-compose.yml
COMPOSE_DEV  := docker compose --env-file .env.development -f docker-compose-dev.yml
COMPOSE_PROD := docker compose --env-file .env.production  -f docker-compose-prod.yml

.DEFAULT_GOAL := help

.PHONY: help generate-secret \
        up down logs ps clean \
        up-dev down-dev logs-dev migrate-dev seed-dev \
        up-prod down-prod logs-prod migrate-prod seed-prod

# -----------------------------------------------------------------------------
# Help
# -----------------------------------------------------------------------------
help:
	@echo ""
	@echo "  register-system"
	@echo ""
	@echo "  Quick start (recruiters / demo)"
	@echo "    make up                   Start everything (build + migrate + seed + api)"
	@echo "    make down                 Stop everything"
	@echo "    make logs                 Follow API logs"
	@echo "    make ps                   List containers"
	@echo "    make clean                Stop + remove volumes"
	@echo ""
	@echo "  Development (hot reload, no build)"
	@echo "    make up-dev               Start DEV stack"
	@echo "    make down-dev             Stop DEV stack"
	@echo "    make logs-dev             Follow DEV API logs"
	@echo "    make migrate-dev          Run migrations"
	@echo "    make seed-dev             Run seeds"
	@echo ""
	@echo "  Production"
	@echo "    make up-prod              Build & start PROD stack"
	@echo "    make down-prod            Stop PROD stack"
	@echo "    make logs-prod            Follow PROD API logs"
	@echo "    make migrate-prod         Run migrations"
	@echo "    make seed-prod            Run seeds"
	@echo ""
	@echo "  Utils"
	@echo "    make generate-secret      Generate a random base64 secret"
	@echo ""

generate-secret:
	@openssl rand -base64 32

# -----------------------------------------------------------------------------
# Quick start (default docker-compose.yml)
# -----------------------------------------------------------------------------
up:
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f api

ps:
	$(COMPOSE) ps

clean:
	$(COMPOSE) down -v --remove-orphans

restart:
	$(COMPOSE) restart api

# -----------------------------------------------------------------------------
# Development
# -----------------------------------------------------------------------------
up-dev:
	$(COMPOSE_DEV) up -d

down-dev:
	$(COMPOSE_DEV) down

logs-dev:
	$(COMPOSE_DEV) logs -f api

migrate-dev:
	@echo "→ Running migrations (DEV)..."
	$(COMPOSE_DEV) run --rm migrate

seed-dev:
	@echo "→ Running seeds (DEV)..."
	$(COMPOSE_DEV) run --rm seed

# -----------------------------------------------------------------------------
# Production
# -----------------------------------------------------------------------------
up-prod:
	$(COMPOSE_PROD) up -d --build

down-prod:
	$(COMPOSE_PROD) down

logs-prod:
	$(COMPOSE_PROD) logs -f api

migrate-prod:
	@echo "→ Running migrations (PROD)..."
	$(COMPOSE_PROD) run --rm migrate

seed-prod:
	@echo "→ Running seeds (PROD)..."
	$(COMPOSE_PROD) run --rm seed