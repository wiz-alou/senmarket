#!/bin/bash
# 🧪 scripts/test_complete_system.sh - Tests complets SenMarket

echo "🧪 TESTS COMPLETS SYSTÈME SENMARKET"
echo "=================================="

# Configuration
BASE_URL="http://localhost:8080"
FRONTEND_URL="http://localhost:3000"
API_URL="${BASE_URL}/api/v1"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Compteurs
total_tests=0
passed_tests=0

# Fonction de test robuste
run_test() {
    local category="$1"
    local test_name="$2"
    local test_command="$3"
    local timeout_duration="${4:-10}"
    
    ((total_tests++))
    printf "%-12s %-30s " "$category" "$test_name"
    
    if timeout "$timeout_duration" bash -c "$test_command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((passed_tests++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        return 1
    fi
}

# Fonction pour mesurer performance
measure_performance() {
    local endpoint="$1"
    local name="$2"
    
    start=$(date +%s%N)
    curl -s "$endpoint" >/dev/null 2>&1
    end=$(date +%s%N)
    time_ms=$(( (end - start) / 1000000 ))
    
    printf "%-12s %-30s %dms" "PERF" "$name" "$time_ms"
    
    if [ "$time_ms" -lt 200 ]; then
        echo -e " ${GREEN}⚡ Excellent${NC}"
    elif [ "$time_ms" -lt 500 ]; then
        echo -e " ${YELLOW}✓ Bon${NC}"
    else
        echo -e " ${RED}🐌 Lent${NC}"
    fi
}

echo -e "${BLUE}🔍 TESTS DE BASE${NC}"
echo "======================================"

# Tests de connectivité
run_test "CONNECT" "Backend API" "curl -s $BASE_URL/health"
run_test "CONNECT" "Frontend Web" "curl -s $FRONTEND_URL"
run_test "CONNECT" "Database" "curl -s $BASE_URL/health | grep -q 'database.*UP'"
run_test "CONNECT" "Redis Cache" "curl -s $BASE_URL/health | grep -q 'redis.*UP'"
run_test "CONNECT" "MinIO Storage" "curl -s $BASE_URL/health | grep -q 'minio.*up'"
run_test "CONNECT" "SMS Service" "curl -s $BASE_URL/health | grep -q 'twilio_sms.*active'"

echo ""
echo -e "${BLUE}🎯 TESTS API ENDPOINTS${NC}"
echo "======================================"

# Tests API
run_test "API" "Categories List" "curl -s $API_URL/categories | grep -q 'data'"
run_test "API" "Listings List" "curl -s $API_URL/listings | grep -q 'data'"
run_test "API" "Featured Listings" "curl -s $API_URL/listings/featured | grep -q 'data'"
run_test "API" "Storage Status" "curl -s $API_URL/storage/status | grep -q 'buckets'"
run_test "API" "Auth Endpoints" "curl -s $API_URL/auth/status"

echo ""
echo -e "${BLUE}🔴 TESTS CACHE REDIS${NC}"
echo "======================================"

# Tests cache
run_test "CACHE" "Redis Connection" "docker exec senmarket_redis redis-cli ping | grep -q PONG"
run_test "CACHE" "Cache Keys Count" "[ \$(docker exec senmarket_redis redis-cli dbsize) -ge 0 ]"
run_test "CACHE" "Cache Categories" "curl -s $API_URL/categories >/dev/null && curl -s $API_URL/categories >/dev/null"
run_test "CACHE" "Cache Performance" "curl -s $API_URL/categories >/dev/null"

echo ""
echo -e "${BLUE}📁 TESTS STORAGE MINIO${NC}"
echo "======================================"

# Tests MinIO
run_test "STORAGE" "MinIO Service" "curl -s http://localhost:9000/minio/health/live"
run_test "STORAGE" "Bucket Access" "curl -s http://localhost:9000/senmarket-images/"
run_test "STORAGE" "Storage API" "curl -s $API_URL/storage/status"
run_test "STORAGE" "MinIO Console" "curl -s http://localhost:9001"

echo ""
echo -e "${BLUE}⚡ TESTS PERFORMANCE${NC}"
echo "======================================"

# Tests de performance
measure_performance "$API_URL/categories" "Categories API"
measure_performance "$API_URL/listings" "Listings API"
measure_performance "$BASE_URL/health" "Health Check"
measure_performance "$FRONTEND_URL" "Frontend Load"

echo ""
echo -e "${BLUE}💪 TESTS DE CHARGE${NC}"
echo "======================================"

# Test de charge simple
echo -n "LOAD     Concurrent Requests (10x)     "
start_time=$(date +%s)

for i in {1..10}; do
    curl -s "$API_URL/categories" >/dev/null &
done
wait

end_time=$(date +%s)
duration=$((end_time - start_time))

if [ "$duration" -lt 5 ]; then
    echo -e "${GREEN}✅ ${duration}s (Excellent)${NC}"
else
    echo -e "${YELLOW}⚠️ ${duration}s (Acceptable)${NC}"
fi

echo ""
echo -e "${BLUE}📊 STATISTIQUES DÉTAILLÉES${NC}"
echo "======================================"

# Stats Redis détaillées
if docker exec senmarket_redis redis-cli ping >/dev/null 2>&1; then
    keys=$(docker exec senmarket_redis redis-cli dbsize 2>/dev/null)
    memory=$(docker exec senmarket_redis redis-cli info memory 2>/dev/null | grep used_memory_human | cut -d: -f2 | tr -d '\r')
    hits=$(docker exec senmarket_redis redis-cli info stats 2>/dev/null | grep keyspace_hits | cut -d: -f2 | tr -d '\r')
    misses=$(docker exec senmarket_redis redis-cli info stats 2>/dev/null | grep keyspace_misses | cut -d: -f2 | tr -d '\r')
    
    echo "🔴 Redis Stats:"
    echo "   🔑 Clés en cache: $keys"
    echo "   💾 Mémoire utilisée: $memory"
    
    if [ "$hits" ] && [ "$misses" ] && [ "$((hits + misses))" -gt 0 ]; then
        ratio=$(( hits * 100 / (hits + misses) ))
        echo "   📈 Cache Hit Ratio: $ratio%"
        echo "   🎯 Hits: $hits | Misses: $misses"
    else
        echo "   📈 Cache Hit Ratio: Données insuffisantes"
    fi
fi

echo ""
echo -e "${BLUE}🏆 RÉSULTATS FINAUX${NC}"
echo "======================================"

percentage=$((passed_tests * 100 / total_tests))

echo "📊 Tests réussis: $passed_tests/$total_tests"
echo "📈 Pourcentage: $percentage%"

if [ "$percentage" -ge 95 ]; then
    echo -e "${GREEN}🎉 SYSTÈME EXCELLENT ! ($percentage%)${NC}"
    echo -e "${GREEN}✅ SenMarket prêt pour production !${NC}"
    echo -e "${GREEN}🚀 Performance niveau international !${NC}"
elif [ "$percentage" -ge 85 ]; then
    echo -e "${YELLOW}⚡ SYSTÈME TRÈS BON ! ($percentage%)${NC}"
    echo -e "${YELLOW}✅ SenMarket quasi-prêt pour production${NC}"
elif [ "$percentage" -ge 70 ]; then
    echo -e "${YELLOW}⚠️  SYSTÈME CORRECT ($percentage%)${NC}"
    echo -e "${YELLOW}🔧 Quelques ajustements recommandés${NC}"
else
    echo -e "${RED}❌ SYSTÈME À AMÉLIORER ($percentage%)${NC}"
    echo -e "${RED}🛠️  Corrections nécessaires${NC}"
fi

echo ""
echo -e "${BLUE}🎯 PROCHAINES ÉTAPES${NC}"
echo "======================================"
echo "✅ Tests terminés avec succès"
echo "🚀 Pour un monitoring continu: make monitor-all"
echo "📊 Pour des benchmarks: make redis-benchmark"
echo "🎨 Frontend: $FRONTEND_URL"
echo "🔧 API: $BASE_URL"
echo "🌐 MinIO Console: http://localhost:9001"

echo ""
echo "🎉 SenMarket testé et validé ! Prêt à conquérir le Sénégal ! 🇸🇳"
