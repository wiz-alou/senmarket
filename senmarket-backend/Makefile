# ============================================
# Makefile
# ============================================
.PHONY: help build run test clean docker-up docker-down migrate

# Variables
APP_NAME := senmarket
DOCKER_COMPOSE := docker-compose
GO_FILES := $(shell find . -name "*.go" -type f)

help: ## Affiche l'aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: ## Compile l'application
	@echo "🔨 Compilation de l'application..."
	@go build -o bin/$(APP_NAME) cmd/server/main.go

run: ## Lance l'application en mode développement
	@echo "🚀 Lancement de l'application..."
	@go run cmd/server/main.go

test: ## Lance les tests
	@echo "🧪 Exécution des tests..."
	@go test -v ./...

test-coverage: ## Lance les tests avec coverage
	@echo "📊 Tests avec coverage..."
	@go test -coverprofile=coverage.out ./...
	@go tool cover -html=coverage.out -o coverage.html

clean: ## Nettoie les fichiers de build
	@echo "🧹 Nettoyage..."
	@rm -rf bin/ tmp/ coverage.out coverage.html

docker-up: ## Lance les services Docker
	@echo "🐳 Lancement des services Docker..."
	@$(DOCKER_COMPOSE) up -d

docker-down: ## Arrête les services Docker
	@echo "🛑 Arrêt des services Docker..."
	@$(DOCKER_COMPOSE) down

docker-logs: ## Affiche les logs Docker
	@$(DOCKER_COMPOSE) logs -f

migrate-up: ## Applique les migrations
	@echo "📊 Application des migrations..."
	@migrate -path migrations -database "postgres://senmarket:senmarket123@localhost:5432/senmarket?sslmode=disable" up

migrate-down: ## Annule les migrations
	@echo "↩️ Annulation des migrations..."
	@migrate -path migrations -database "postgres://senmarket:senmarket123@localhost:5432/senmarket?sslmode=disable" down

migrate-create: ## Crée une nouvelle migration (usage: make migrate-create NAME=nom_migration)
	@migrate create -ext sql -dir migrations $(NAME)

deps: ## Installe les dépendances
	@echo "📦 Installation des dépendances..."
	@go mod tidy
	@go mod download

fmt: ## Formate le code
	@echo "✨ Formatage du code..."
	@go fmt ./...

lint: ## Lance le linter
	@echo "🔍 Linting..."
	@golangci-lint run

dev: docker-up ## Lance l'environnement de développement
	@echo "🚀 Environnement de développement prêt !"
	@echo "📊 PostgreSQL: localhost:5432"
	@echo "🔴 Redis: localhost:6379"
	@echo "📁 MinIO: http://localhost:9001"

install-tools: ## Installe les outils de développement
	@echo "🛠️ Installation des outils..."
	@go install github.com/cosmtrek/air@latest
	@go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

air: ## Lance l'application avec hot reload
	@air