#!/bin/bash
# 🔧 scripts/fix_minio_bucket.sh - Correction bucket MinIO

echo "📁 CORRECTION BUCKET MINIO SENMARKET"
echo "=================================="

# Configuration
MINIO_HOST="localhost"
MINIO_PORT="9000"
MINIO_CONSOLE_PORT="9001"
BUCKET_NAME="senmarket-images"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}1. Vérification état MinIO...${NC}"

# Vérifier si MinIO tourne
if curl -s http://$MINIO_HOST:$MINIO_PORT/minio/health/live >/dev/null 2>&1; then
    echo -e "✅ MinIO service: ${GREEN}UP${NC}"
else
    echo -e "❌ MinIO service: ${RED}DOWN${NC}"
    echo "🚀 Démarrage MinIO..."
    docker-compose up -d minio
    sleep 10
fi

echo -e "\n${YELLOW}2. Configuration bucket...${NC}"

# Méthode 1: Via docker exec (le plus fiable)
echo "📁 Création bucket via docker exec..."

# Accéder au container MinIO et créer le bucket
docker exec senmarket_minio sh -c "
    # Créer le bucket s'il n'existe pas
    mkdir -p /data/$BUCKET_NAME
    
    # Vérifier que le bucket existe
    if [ -d \"/data/$BUCKET_NAME\" ]; then
        echo 'Bucket $BUCKET_NAME créé/vérifié'
    else
        echo 'Erreur création bucket'
        exit 1
    fi
"

if [ $? -eq 0 ]; then
    echo -e "✅ Bucket: ${GREEN}Créé/Vérifié${NC}"
else
    echo -e "❌ Bucket: ${RED}Erreur création${NC}"
fi

echo -e "\n${YELLOW}3. Test accès bucket...${NC}"

# Test 1: Via API MinIO directe
echo "🔍 Test API MinIO..."
if curl -s http://$MINIO_HOST:$MINIO_PORT/$BUCKET_NAME/ >/dev/null 2>&1; then
    echo -e "✅ API MinIO: ${GREEN}Accessible${NC}"
else
    echo -e "⚠️  API MinIO: ${YELLOW}Non accessible directement (normal si privé)${NC}"
fi

# Test 2: Via API SenMarket
echo "🔍 Test API SenMarket..."
if curl -s http://localhost:8080/api/v1/storage/status | grep -q "buckets\|status"; then
    echo -e "✅ API SenMarket: ${GREEN}Bucket détecté${NC}"
else
    echo -e "❌ API SenMarket: ${RED}Bucket non détecté${NC}"
fi

echo -e "\n${YELLOW}4. Informations utiles...${NC}"
echo "🌐 Console MinIO: http://$MINIO_HOST:$MINIO_CONSOLE_PORT"
echo "👤 User: senmarket"
echo "🔑 Pass: senmarket123"
echo "📁 Bucket: $BUCKET_NAME"

echo -e "\n✅ Script terminé !"
