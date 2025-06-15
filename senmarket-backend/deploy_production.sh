#!/bin/bash
# 🚀 DÉPLOIEMENT PRODUCTION SENMARKET - JOUR 3 FINAL

echo "🇸🇳 DÉPLOIEMENT SENMARKET PRODUCTION"
echo "===================================="

# Variables de configuration
DOMAIN="senmarket.sn"
APP_DIR="/opt/senmarket"
BACKUP_DIR="/opt/backup/senmarket"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. PRÉPARATION SERVEUR
log_info "1. Préparation du serveur production..."

# Mise à jour système
sudo apt update && sudo apt upgrade -y

# Installation Docker si nécessaire
if ! command -v docker &> /dev/null; then
    log_info "Installation Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    log_success "Docker installé"
fi

# Installation Docker Compose
if ! command -v docker-compose &> /dev/null; then
    log_info "Installation Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    log_success "Docker Compose installé"
fi

# Installation Nginx
sudo apt install nginx certbot python3-certbot-nginx -y

# 2. CONFIGURATION RÉPERTOIRES
log_info "2. Configuration des répertoires..."
sudo mkdir -p $APP_DIR
sudo mkdir -p $BACKUP_DIR
sudo mkdir -p /var/log/senmarket
sudo chown -R $USER:$USER $APP_DIR

# 3. CONFIGURATION PRODUCTION
log_info "3. Configuration environnement production..."

# Fichier .env production
cat > $APP_DIR/.env.production << 'EOF'
# Production Environment SenMarket
ENV=production
PORT=8080
API_URL=https://api.senmarket.sn

# Database Production
DB_HOST=postgres
DB_PORT=5432
DB_USER=senmarket
DB_PASSWORD=SENMARKET_PROD_DB_PASSWORD_2025
DB_NAME=senmarket_prod
DB_SSL_MODE=require

# Redis Production
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=SENMARKET_REDIS_PASSWORD_2025

# JWT Production
JWT_SECRET=SENMARKET_JWT_SUPER_SECRET_PRODUCTION_KEY_2025
JWT_EXPIRY=24h

# Orange Money Production (à configurer avec tes vraies clés)
ORANGE_MONEY_API_URL=https://api.orange.com/orange-money-webpay/prod
ORANGE_MONEY_MERCHANT_KEY=YOUR_REAL_PRODUCTION_KEY
ORANGE_MONEY_MERCHANT_SECRET=YOUR_REAL_PRODUCTION_SECRET

# SMS Sénégal Production
SMS_API_URL=https://api.senegal-sms.com
SMS_API_KEY=YOUR_SMS_PRODUCTION_KEY
SMS_SENDER=SenMarket

# Security
BCRYPT_COST=14
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=1h

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_EXTENSIONS=jpg,jpeg,png,webp
IMAGE_QUALITY=85
EOF

# 4. DOCKER COMPOSE PRODUCTION
log_info "4. Configuration Docker Production..."

cat > $APP_DIR/docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: docker/Dockerfile.prod
    container_name: senmarket_app
    restart: unless-stopped
    ports:
      - "8080:8080"
    env_file:
      - .env.production
    volumes:
      - ./uploads:/app/uploads
      - ./public:/app/public
      - /var/log/senmarket:/app/logs
    depends_on:
      - postgres
      - redis
    networks:
      - senmarket
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:15-alpine
    container_name: senmarket_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: senmarket_prod
      POSTGRES_USER: senmarket
      POSTGRES_PASSWORD: SENMARKET_PROD_DB_PASSWORD_2025
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backup:/backup
    networks:
      - senmarket
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U senmarket"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    container_name: senmarket_redis
    restart: unless-stopped
    command: redis-server --requirepass SENMARKET_REDIS_PASSWORD_2025 --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - senmarket
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    container_name: senmarket_nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.prod.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - ./uploads:/var/www/uploads
      - ./public:/var/www/public
    depends_on:
      - app
    networks:
      - senmarket

volumes:
  postgres_data:
  redis_data:

networks:
  senmarket:
    driver: bridge
EOF

# 5. CONFIGURATION NGINX PRODUCTION
log_info "5. Configuration Nginx Production..."

cat > $APP_DIR/nginx.prod.conf << 'EOF'
events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Security
    server_tokens off;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=uploads:10m rate=5r/s;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Upstream
    upstream backend {
        server app:8080;
        keepalive 32;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name senmarket.sn www.senmarket.sn api.senmarket.sn;
        return 301 https://$server_name$request_uri;
    }

    # API Server
    server {
        listen 443 ssl http2;
        server_name api.senmarket.sn;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # API Routes
        location / {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 5s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Uploads
        location /uploads/ {
            limit_req zone=uploads burst=10 nodelay;
            alias /var/www/uploads/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # PWA Files
        location /public/ {
            alias /var/www/public/;
            expires 1d;
        }

        # Health check
        location /health {
            proxy_pass http://backend/health;
            access_log off;
        }
    }

    # Main Website (Frontend)
    server {
        listen 443 ssl http2;
        server_name senmarket.sn www.senmarket.sn;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # PWA Support
        location /manifest.json {
            alias /var/www/public/manifest.json;
            add_header Content-Type application/manifest+json;
        }

        location /sw.js {
            alias /var/www/public/sw.js;
            add_header Content-Type application/javascript;
            add_header Cache-Control "no-cache";
        }

        # Frontend (Coming soon page for now)
        location / {
            return 200 '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SenMarket - Bientôt Disponible</title>
    <link rel="manifest" href="/manifest.json">
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 100vh; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; }
        h1 { font-size: 3rem; margin-bottom: 1rem; }
        p { font-size: 1.2rem; margin-bottom: 2rem; }
        .api-link { background: white; color: #667eea; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🇸🇳 SenMarket</h1>
        <p>Le marketplace #1 du Sénégal arrive bientôt !</p>
        <p>API déjà disponible :</p>
        <a href="https://api.senmarket.sn/health" class="api-link">Tester l'\''API</a>
    </div>
    <script>
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js");
        }
    </script>
</body>
</html>';
            add_header Content-Type text/html;
        }
    }
}
EOF

# 6. DOCKERFILE PRODUCTION
log_info "6. Configuration Dockerfile Production..."

mkdir -p $APP_DIR/docker
cat > $APP_DIR/docker/Dockerfile.prod << 'EOF'
# Production Dockerfile pour SenMarket
FROM golang:1.21-alpine AS builder

# Installer les dépendances de build
RUN apk add --no-cache git ca-certificates tzdata

# Définir le répertoire de travail
WORKDIR /app

# Copier go.mod et go.sum
COPY go.mod go.sum ./

# Télécharger les dépendances
RUN go mod download

# Copier le code source
COPY . .

# Build de l'application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main cmd/server/main.go

# Image finale
FROM alpine:latest

# Installer ca-certificates pour HTTPS
RUN apk --no-cache add ca-certificates curl tzdata

# Créer un utilisateur non-root
RUN adduser -D -s /bin/sh senmarket

# Définir le répertoire de travail
WORKDIR /app

# Copier l'executable depuis le builder
COPY --from=builder /app/main .
COPY --from=builder /app/uploads ./uploads
COPY --from=builder /app/public ./public

# Changer le propriétaire
RUN chown -R senmarket:senmarket /app

# Utiliser l'utilisateur non-root
USER senmarket

# Exposer le port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Commande de démarrage
CMD ["./main"]
EOF

# 7. SCRIPTS DE GESTION
log_info "7. Création des scripts de gestion..."

# Script de backup
cat > $APP_DIR/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backup/senmarket"
DATE=$(date +%Y%m%d_%H%M%S)

echo "🔄 Début du backup - $DATE"

# Backup base de données
echo "📊 Backup base de données..."
docker exec senmarket_postgres pg_dump -U senmarket senmarket_prod > $BACKUP_DIR/db_$DATE.sql

# Backup uploads
echo "📷 Backup images..."
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C /opt/senmarket uploads

# Backup configuration
echo "⚙️ Backup configuration..."
tar -czf $BACKUP_DIR/config_$DATE.tar.gz -C /opt/senmarket .env.production docker-compose.prod.yml nginx.prod.conf

# Nettoyer les anciens backups (garder 7 jours)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "✅ Backup terminé - $DATE"
EOF

chmod +x $APP_DIR/backup.sh

# Script de déploiement
cat > $APP_DIR/deploy.sh << 'EOF'
#!/bin/bash
cd /opt/senmarket

echo "🚀 Déploiement SenMarket..."

# Pull dernière version
git pull origin main

# Rebuild et redémarrage
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Vérifier la santé
sleep 30
curl -f http://localhost:8080/health

echo "✅ Déploiement terminé"
EOF

chmod +x $APP_DIR/deploy.sh

# 8. CRON JOBS
log_info "8. Configuration des tâches automatiques..."

# Ajouter les cron jobs
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/senmarket/backup.sh >> /var/log/senmarket/backup.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
(crontab -l 2>/dev/null; echo "*/5 * * * * curl -f http://localhost:8080/health > /dev/null 2>&1 || echo 'SenMarket API Down' >> /var/log/senmarket/health.log") | crontab -

# 9. FINALISATION
log_info "9. Finalisation..."

# Copier le code actuel
if [ -d "/home/$USER/myprojet/senmarket/senmarket-backend" ]; then
    log_info "Copie du code existant..."
    cp -r /home/$USER/myprojet/senmarket/senmarket-backend/* $APP_DIR/
    sudo chown -R $USER:$USER $APP_DIR
fi

log_success "Configuration production terminée !"
echo ""
echo "🎯 PROCHAINES ÉTAPES:"
echo "1. Configurer le DNS pour pointer vers ce serveur"
echo "2. Obtenir les certificats SSL: sudo certbot --nginx -d senmarket.sn -d www.senmarket.sn -d api.senmarket.sn"
echo "3. Configurer les vraies clés Orange Money en production"
echo "4. Lancer: cd $APP_DIR && docker-compose -f docker-compose.prod.yml up -d"
echo "5. Vérifier: curl https://api.senmarket.sn/health"
echo ""
echo "✅ SenMarket prêt pour la production ! 🇸🇳"