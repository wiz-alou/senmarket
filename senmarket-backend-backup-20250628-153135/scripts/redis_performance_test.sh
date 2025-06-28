// ============================================
// 3. SCRIPT: scripts/redis_performance_test.sh
// ============================================
#!/bin/bash

echo "🔴 Test de Performance Redis SenMarket"
echo "====================================="

# Configuration
BASE_URL="http://localhost:8080"
API_URL="${BASE_URL}/api/v1"
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASS="your-redis-password-here"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}1. Nettoyage du cache pour test à froid...${NC}"
redis-cli -h $REDIS_HOST -p $REDIS_PORT -a "$REDIS_PASS" FLUSHALL > /dev/null 2>&1

echo -e "\n${YELLOW}2. Test des endpoints avec cache MISS...${NC}"

endpoints=(
    "/categories"
    "/listings?page=1&limit=20"
    "/listings/featured" 
    "/listings/search?q=voiture"
)

declare -A miss_times
declare -A hit_times

for endpoint in "${endpoints[@]}"; do
    echo -e "  📊 Test: ${endpoint}"
    
    # Test MISS (cache vide)
    start_time=$(date +%s%N)
    curl -s "${API_URL}${endpoint}" > /dev/null
    end_time=$(date +%s%N)
    miss_time=$(( (end_time - start_time) / 1000000 )) # en ms
    miss_times["$endpoint"]=$miss_time
    
    # Petit délai
    sleep 0.5
    
    # Test HIT (cache chaud)
    start_time=$(date +%s%N)
    curl -s "${API_URL}${endpoint}" > /dev/null
    end_time=$(date +%s%N)
    hit_time=$(( (end_time - start_time) / 1000000 )) # en ms
    hit_times["$endpoint"]=$hit_time
    
    improvement=$(( (miss_time - hit_time) * 100 / miss_time ))
    
    echo -e "    MISS: ${miss_time}ms | HIT: ${hit_time}ms | Amélioration: ${improvement}%"
done

echo -e "\n${YELLOW}3. Test de charge avec cache...${NC}"

# Test avec plusieurs requêtes simultanées
echo -e "  🔥 10 requêtes simultanées sur /categories..."

for i in {1..10}; do
    curl -s "${API_URL}/categories" > /dev/null &
done
wait

echo -e "  ✅ Test de charge terminé"

echo -e "\n${YELLOW}4. Analyse Redis...${NC}"

# Statistiques Redis
redis_info=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT -a "$REDIS_PASS" INFO stats 2>/dev/null)
keyspace_hits=$(echo "$redis_info" | grep "keyspace_hits:" | cut -d: -f2 | tr -d '\r')
keyspace_misses=$(echo "$redis_info" | grep "keyspace_misses:" | cut -d: -f2 | tr -d '\r')

if [[ $keyspace_hits && $keyspace_misses ]]; then
    total_ops=$((keyspace_hits + keyspace_misses))
    hit_ratio=$(( keyspace_hits * 100 / total_ops ))
    echo -e "  📈 Hit Ratio: ${hit_ratio}%"
    echo -e "  🎯 Hits: ${keyspace_hits}"
    echo -e "  ❌ Misses: ${keyspace_misses}"
else
    echo -e "  ⚠️  Impossible de récupérer les stats Redis"
fi

# Nombre de clés en cache
total_keys=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT -a "$REDIS_PASS" DBSIZE 2>/dev/null)
echo -e "  🔑 Total clés en cache: ${total_keys}"

echo -e "\n${GREEN}✅ Test de performance terminé !${NC}"

# Résumé des améliorations
echo -e "\n${BLUE}📊 Résumé des performances:${NC}"
total_improvement=0
count=0

for endpoint in "${endpoints[@]}"; do
    miss=${miss_times["$endpoint"]}
    hit=${hit_times["$endpoint"]}
    improvement=$(( (miss - hit) * 100 / miss ))
    total_improvement=$((total_improvement + improvement))
    count=$((count + 1))
    
    echo -e "  ${endpoint}: ${improvement}% d'amélioration"
done

avg_improvement=$((total_improvement / count))
echo -e "\n🚀 Amélioration moyenne: ${avg_improvement}%"
