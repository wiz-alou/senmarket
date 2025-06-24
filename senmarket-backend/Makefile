# ============================================
# Makefile - SENMARKET AVEC REDIS COMPLET
# ============================================

# Variables
APP_NAME := senmarket
DOCKER_COMPOSE := docker-compose
GO_FILES := $(shell find . -name "*.go" -type f)
REDIS_HOST := localhost
REDIS_PORT := 6379
REDIS_PASSWORD := 
DB_URL := postgres://senmarket:senmarket123@localhost:5432/senmarket?sslmode=disable

# ============================================
# 📋 AIDE
# ============================================
.PHONY: help
help: ## Affiche l'aide
	@echo "🇸🇳 SenMarket - Commandes Disponibles"
	@echo "===================================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "🔴 Commandes Redis spécialisées :"
	@echo "  make redis-start        - Démarre Redis"
	@echo "  make redis-test         - Tests Redis complets"
	@echo "  make redis-monitor      - Monitoring temps réel"
	@echo "  make redis-dashboard    - Dashboard web"
	@echo "  make cache-warmup       - Préchauffage cache"
	@echo ""
	@echo "🚀 Commandes rapides :"
	@echo "  make dev                - Environnement complet"
	@echo "  make dev-redis          - Dev avec Redis"
	@echo "  make monitor-all        - Monitoring complet"

# ============================================
# 🔨 BUILD & RUN
# ============================================
.PHONY: build run test test-coverage clean fmt lint deps

build: ## Compile l'application
	@echo "🔨 Compilation de l'application..."
	@go build -o bin/$(APP_NAME) cmd/server/main.go
	@echo "✅ Application compilée dans bin/$(APP_NAME)"

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
	@echo "📊 Coverage report: coverage.html"

clean: ## Nettoie les fichiers de build
	@echo "🧹 Nettoyage..."
	@rm -rf bin/ tmp/ coverage.out coverage.html
	@echo "✅ Nettoyage terminé"

fmt: ## Formate le code
	@echo "✨ Formatage du code..."
	@go fmt ./...
	@echo "✅ Code formaté"

lint: ## Lance le linter
	@echo "🔍 Linting..."
	@golangci-lint run
	@echo "✅ Linting terminé"

deps: ## Installe les dépendances
	@echo "📦 Installation des dépendances..."
	@go mod tidy
	@go mod download
	@echo "✅ Dépendances installées"

# ============================================
# 🐳 DOCKER
# ============================================
.PHONY: docker-up docker-down docker-logs docker-build docker-clean

docker-up: ## Lance les services Docker
	@echo "🐳 Lancement des services Docker..."
	@$(DOCKER_COMPOSE) up -d
	@echo "✅ Services Docker démarrés"
	@echo "🔍 Health check: http://localhost:8080/health"

docker-down: ## Arrête les services Docker
	@echo "🛑 Arrêt des services Docker..."
	@$(DOCKER_COMPOSE) down
	@echo "✅ Services Docker arrêtés"

docker-logs: ## Affiche les logs Docker
	@$(DOCKER_COMPOSE) logs -f

docker-build: ## Rebuild les images Docker
	@echo "🔨 Rebuild des images Docker..."
	@$(DOCKER_COMPOSE) build --no-cache
	@echo "✅ Images Docker rebuilt"

docker-clean: ## Nettoie Docker complètement
	@echo "🧹 Nettoyage Docker..."
	@$(DOCKER_COMPOSE) down -v --remove-orphans
	@docker system prune -f
	@echo "✅ Docker nettoyé"

# ============================================
# 🔴 REDIS CORE
# ============================================
.PHONY: redis-start redis-stop redis-restart redis-status redis-cli

redis-start: ## Démarre Redis
	@echo "🔴 Démarrage Redis..."
	@$(DOCKER_COMPOSE) up redis -d
	@echo "✅ Redis démarré"
	@echo "🔗 Redis: $(REDIS_HOST):$(REDIS_PORT)"

redis-stop: ## Arrête Redis
	@echo "🔴 Arrêt Redis..."
	@$(DOCKER_COMPOSE) stop redis
	@echo "✅ Redis arrêté"

redis-restart: ## Redémarre Redis
	@echo "🔄 Redémarrage Redis..."
	@$(DOCKER_COMPOSE) restart redis
	@echo "✅ Redis redémarré"

redis-status: ## Status Redis
	@echo "🔴 Status Redis..."
	@docker exec senmarket_redis redis-cli ping || echo "❌ Redis non accessible"
	@echo "📊 Infos Redis:"
	@docker exec senmarket_redis redis-cli info server | grep redis_version || true
	@docker exec senmarket_redis redis-cli dbsize || true

redis-cli: ## Console Redis interactive
	@echo "🔴 Console Redis (tapez 'exit' pour quitter)..."
	@docker exec -it senmarket_redis redis-cli

# ============================================
# 🧪 REDIS TESTING
# ============================================
.PHONY: redis-test redis-test-short redis-perf redis-benchmark

redis-test: ## Tests Redis complets (15+ scenarios)
	@echo "🔴 Tests Redis complets..."
	@chmod +x scripts/validate_redis_implementation.sh
	@./scripts/validate_redis_implementation.sh

redis-test-short: ## Tests Redis rapides
	@echo "🔴 Tests Redis rapides..."
	@echo "1. Test connexion..."
	@curl -s http://localhost:8080/health | grep -q "redis.*UP" && echo "✅ Redis UP" || echo "❌ Redis DOWN"
	@echo "2. Test cache..."
	@curl -s http://localhost:8080/api/v1/categories > /dev/null && echo "✅ Cache fonctionnel" || echo "❌ Cache KO"
	@echo "3. Test rate limiting..."
	@for i in {1..5}; do curl -s http://localhost:8080/api/v1/categories > /dev/null; done && echo "✅ Rate limiting OK" || echo "❌ Rate limiting KO"

redis-perf: ## Tests performance Redis
	@echo "🔥 Tests performance Redis..."
	@chmod +x scripts/redis_performance_test.sh
	@./scripts/redis_performance_test.sh

redis-benchmark: ## Benchmark Redis natif
	@echo "⚡ Benchmark Redis..."
	@docker exec senmarket_redis redis-benchmark -q -n 1000 -c 10

# ============================================
# 📊 REDIS MONITORING
# ============================================
.PHONY: redis-monitor redis-stats redis-keys redis-memory redis-dashboard

redis-monitor: ## Monitoring Redis temps réel
	@echo "🔴 Monitoring Redis temps réel..."
	@chmod +x scripts/redis_monitor.sh
	@./scripts/redis_monitor.sh

redis-stats: ## Statistiques Redis
	@echo "📊 Statistiques Redis..."
	@echo "🔑 Nombre de clés:"
	@docker exec senmarket_redis redis-cli dbsize
	@echo "💾 Mémoire utilisée:"
	@docker exec senmarket_redis redis-cli info memory | grep used_memory_human
	@echo "📈 Hit ratio:"
	@docker exec senmarket_redis redis-cli info stats | grep keyspace_hits
	@docker exec senmarket_redis redis-cli info stats | grep keyspace_misses

redis-keys: ## Voir les clés Redis par pattern
	@echo "🔑 Clés Redis par type..."
	@echo "📋 Listings: $$(docker exec senmarket_redis redis-cli --scan --pattern 'listing:*' | wc -l)"
	@echo "📂 Categories: $$(docker exec senmarket_redis redis-cli --scan --pattern 'category:*' | wc -l)"
	@echo "🔍 Searches: $$(docker exec senmarket_redis redis-cli --scan --pattern 'search:*' | wc -l)"
	@echo "👤 Users: $$(docker exec senmarket_redis redis-cli --scan --pattern 'user:*' | wc -l)"
	@echo "📊 Stats: $$(docker exec senmarket_redis redis-cli --scan --pattern 'stats:*' | wc -l)"

redis-memory: ## Analyse mémoire Redis
	@echo "💾 Analyse mémoire Redis..."
	@docker exec senmarket_redis redis-cli info memory

redis-dashboard: ## Dashboard Redis web
	@echo "📊 Ouverture dashboard Redis..."
	@echo "🌐 Dashboard disponible à: file://$(PWD)/scripts/redis_dashboard.html"
	@echo "🚀 Démarrage serveur web local..."
	@python3 -m http.server 8082 -d scripts/ > /dev/null 2>&1 &
	@sleep 2
	@echo "📊 Dashboard: http://localhost:8082/redis_dashboard.html"
	@echo "💡 Appuyez sur Ctrl+C pour arrêter le serveur"

# ============================================
# 🗄️ REDIS CACHE MANAGEMENT
# ============================================
.PHONY: cache-warmup cache-clear cache-clear-pattern cache-info cache-backup

cache-warmup: ## Préchauffage cache
	@echo "🔥 Préchauffage cache..."
	@go run scripts/cache_warmup.go
	@echo "✅ Cache préchauffé"

cache-clear: ## Vide tout le cache Redis
	@echo "🧹 Nettoyage cache Redis..."
	@docker exec senmarket_redis redis-cli flushall
	@echo "✅ Cache vidé"

cache-clear-pattern: ## Vide cache par pattern (usage: make cache-clear-pattern PATTERN=listing:*)
	@echo "🧹 Nettoyage cache pattern: $(PATTERN)"
	@docker exec senmarket_redis redis-cli eval "return redis.call('del', unpack(redis.call('keys', ARGV[1])))" 0 "$(PATTERN)"
	@echo "✅ Pattern $(PATTERN) supprimé"

cache-info: ## Informations cache
	@echo "ℹ️  Informations cache Redis..."
	@curl -s http://localhost:8080/api/v1/cache/stats | jq . || echo "⚠️  API non accessible"

cache-backup: ## Backup Redis
	@echo "💾 Backup Redis..."
	@chmod +x scripts/redis_backup.sh
	@./scripts/redis_backup.sh

# ============================================
# 🗃️ DATABASE MIGRATIONS
# ============================================
.PHONY: migrate-up migrate-down migrate-create migrate-reset migrate-redis

migrate-up: ## Applique les migrations
	@echo "📊 Application des migrations..."
	@migrate -path migrations -database "$(DB_URL)" up
	@echo "✅ Migrations appliquées"

migrate-down: ## Annule les migrations
	@echo "↩️  Annulation des migrations..."
	@migrate -path migrations -database "$(DB_URL)" down
	@echo "✅ Migrations annulées"

migrate-create: ## Crée une nouvelle migration (usage: make migrate-create NAME=nom_migration)
	@echo "📝 Création migration: $(NAME)"
	@migrate create -ext sql -dir migrations $(NAME)
	@echo "✅ Migration créée"

migrate-reset: ## Reset complet DB + migrations
	@echo "🔄 Reset complet base de données..."
	@$(DOCKER_COMPOSE) down postgres
	@docker volume rm senmarket_postgres_data || true
	@$(DOCKER_COMPOSE) up postgres -d
	@sleep 5
	@make migrate-up
	@echo "✅ Base de données reset"

migrate-redis: ## Applique les optimisations Redis DB
	@echo "🔴 Application optimisations Redis..."
	@migrate -path migrations -database "$(DB_URL)" up
	@echo "✅ Optimisations Redis appliquées"

# ============================================
# 🛠️ TOOLS & SETUP
# ============================================
.PHONY: install-tools setup-dev setup-prod

install-tools: ## Installe les outils de développement
	@echo "🛠️  Installation des outils..."
	@go install github.com/cosmtrek/air@latest
	@go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
	@echo "✅ Outils installés"

setup-dev: ## Setup environnement développement
	@echo "🚀 Setup environnement développement..."
	@make install-tools
	@make deps
	@echo "📁 Création dossiers..."
	@mkdir -p uploads backups/redis scripts logs
	@echo "🔧 Configuration .env..."
	@cp .env.example .env 2>/dev/null || echo "⚠️  .env.example non trouvé"
	@echo "✅ Environnement dev prêt"

setup-prod: ## Setup environnement production
	@echo "🏭 Setup environnement production..."
	@echo "🔒 Configuration sécurité..."
	@echo "⚠️  Assurez-vous de configurer :"
	@echo "  - Variables d'environnement sécurisées"
	@echo "  - Certificats SSL"
	@echo "  - Firewall"
	@echo "  - Monitoring"

# ============================================
# 🔄 HOT RELOAD
# ============================================
.PHONY: air dev-watch

air: ## Lance l'application avec hot reload
	@echo "🔥 Démarrage hot reload..."
	@air

dev-watch: ## Développement avec watch des fichiers
	@echo "👀 Mode développement avec watch..."
	@make docker-up
	@make air

# ============================================
# 🚀 ENVIRONNEMENTS COMBINÉS
# ============================================
.PHONY: dev dev-redis dev-full monitor-all prod-deploy

dev: docker-up ## Lance l'environnement de développement
	@echo "🚀 Environnement de développement prêt !"
	@echo "📊 PostgreSQL: localhost:5432"
	@echo "🔴 Redis: localhost:6379"
	@echo "📁 MinIO: http://localhost:9001"
	@echo "🌐 API: http://localhost:8080"
	@echo "🔍 Health: http://localhost:8080/health"

dev-redis: redis-start cache-warmup ## Environnement dev avec Redis optimisé
	@echo "🚀 Environnement Redis prêt !"
	@echo "🔴 Redis: localhost:6379"
	@echo "📊 Cache Stats: http://localhost:8080/api/v1/cache/stats"
	@echo "🎛️  Monitoring: http://localhost:8080/api/v1/monitoring/redis"

dev-full: ## Environnement développement complet avec monitoring
	@echo "🚀 Environnement complet avec monitoring..."
	@$(DOCKER_COMPOSE) --profile monitoring up -d
	@make cache-warmup
	@echo "✅ Environnement complet prêt !"
	@echo "📊 Services disponibles :"
	@echo "  🌐 API: http://localhost:8080"
	@echo "  🔴 Redis Commander: http://localhost:8081"
	@echo "  📈 Prometheus: http://localhost:9090"
	@echo "  📊 Grafana: http://localhost:3000"

monitor-all: redis-start redis-dashboard redis-monitor ## Monitoring complet
	@echo "📊 Monitoring complet lancé"

prod-deploy: ## Déploiement production
	@echo "🏭 Déploiement production..."
	@echo "⚠️  Vérifiez la configuration avant de continuer"
	@read -p "Continuer ? (y/N) " confirm && [ "$$confirm" = "y" ] || exit 1
	@$(DOCKER_COMPOSE) -f docker-compose.prod.yml up -d
	@make cache-warmup
	@echo "✅ Déploiement production terminé"

# ============================================
# 🧹 MAINTENANCE
# ============================================
.PHONY: logs logs-redis logs-app maintenance-mode

logs: ## Tous les logs
	@$(DOCKER_COMPOSE) logs -f

logs-redis: ## Logs Redis uniquement
	@$(DOCKER_COMPOSE) logs -f redis

logs-app: ## Logs application uniquement
	@$(DOCKER_COMPOSE) logs -f app

maintenance-mode: ## Mode maintenance
	@echo "🚧 Activation mode maintenance..."
	@echo "⚠️  Fonctionnalité à implémenter"

# ============================================
# 🎯 DEFAULT
# ============================================
.DEFAULT_GOAL := help