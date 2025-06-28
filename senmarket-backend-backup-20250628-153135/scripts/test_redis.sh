# ============================================
# 4. SCRIPT: scripts/test_redis.sh
# ============================================

#!/bin/bash

echo "🔴 Test de l'implémentation Redis SenMarket"
echo "============================================"

# Couleurs pour les logs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
BASE_URL="http://localhost:8080"
API_URL="${BASE_URL}/api/v1"

echo -e "${YELLOW}1. Test de santé Redis...${NC}"
curl -s "${BASE_URL}/health" | jq -r '.checks.redis // "N/A"'

echo -e "\n${YELLOW}2. Test cache des catégories...${NC}"
echo "Premier appel (doit être MISS):"
curl -s "${API_URL}/categories" -H "Accept: application/json" -I | grep -E "(X-Cache|HTTP)"

echo "Deuxième appel (doit être HIT):"
curl -s "${API_URL}/categories" -H "Accept: application/json" -I | grep -E "(X-Cache|HTTP)"

echo -e "\n${YELLOW}3. Test rate limiting...${NC}"
echo "Envoi de 15 requêtes rapides (limite = 10/min pour auth):"
for i in {1..15}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/auth/login" \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"phone": "+221000000000", "password": "test"}')
  
  if [ "$STATUS" = "429" ]; then
    echo -e "${RED}Requête $i: Rate limited (429) ✅${NC}"
    break
  else
    echo -e "${GREEN}Requête $i: OK ($STATUS)${NC}"
  fi
done

echo -e "\n${YELLOW}4. Test cache listings...${NC}"
echo "Test pagination avec cache:"
curl -s "${API_URL}/listings?page=1&limit=10" -I | grep -E "(X-Cache|HTTP)"
curl -s "${API_URL}/listings?page=1&limit=10" -I | grep -E "(X-Cache|HTTP)"

echo -e "\n${YELLOW}5. Test cache search...${NC}"
echo "Test recherche avec cache:"
curl -s "${API_URL}/listings/search?q=voiture" -I | grep -E "(X-Cache|HTTP)"
curl -s "${API_URL}/listings/search?q=voiture" -I | grep -E "(X-Cache|HTTP)"

echo -e "\n${GREEN}✅ Tests Redis terminés !${NC}"