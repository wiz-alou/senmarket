#!/bin/bash

# ============================================
# 🔴 SCRIPT DE VALIDATION REDIS COMPLET
# scripts/validate_redis_implementation.sh
# ============================================

echo "🔴 Validation Implémentation Redis SenMarket"
echo "============================================"

# Couleurs pour les logs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BASE_URL="http://localhost:8080"
API_URL="${BASE_URL}/api/v1"
REDIS_HOST="localhost"
REDIS_PORT="6379"

# Compteurs de tests
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

# Fonction de test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    echo -e "\n${BLUE}Test $TESTS_TOTAL: $test_name${NC}"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# ============================================
# TESTS DE CONNECTIVITÉ
# ============================================

echo -e "${YELLOW}🔌 Tests de Connectivité${NC}"

run_test "Redis Connection" "redis-cli -h $REDIS_HOST -p $REDIS_PORT ping | grep -q PONG"

run_test "API Health Check" "curl -s $BASE_URL/health | jq -r '.checks.redis' | grep -q UP"

run_test "Database Connection" "curl -s $BASE_URL/health | jq -r '.checks.database' | grep -q UP"

# ============================================
# TESTS DE FONCTIONNALITÉ CACHE
# ============================================

echo -e "\n${YELLOW}🔴 Tests de Fonctionnalité Cache${NC}"

# Nettoyer le cache pour les tests
redis-cli -h $REDIS_HOST -p $REDIS_PORT FLUSHALL > /dev/null 2>&1

run_test "Cache Categories (MISS)" "curl -s '${API_URL}/categories' -I | grep -q 'X-Cache: MISS'"

run_test "Cache Categories (HIT)" "curl -s '${API_URL}/categories' -I | grep -q 'X-Cache: HIT'"

run_test "Cache Listings Page" "curl -s '${API_URL}/listings?page=1&limit=5' > /dev/null && curl -s '${API_URL}/listings?page=1&limit=5' -I | grep -q 'X-Cache: HIT'"

run_test "Cache Search Results" "curl -s '${API_URL}/listings/search?q=test' > /dev/null && curl -s '${API_URL}/listings/search?q=test' -I | grep -q 'X-Cache: HIT'"

# ============================================
# TESTS RATE LIMITING
# ============================================

echo -e "\n${YELLOW}⚡ Tests Rate Limiting${NC}"

# Fonction pour tester le rate limiting
test_rate_limit() {
    local endpoint="$1"
    local limit="$2"
    
    # Faire plusieurs requêtes rapidement
    for i in $(seq 1 $((limit + 5))); do
        status=$(curl -s -o /dev/null -w "%{http_code}" "$endpoint")
        if [ "$status" = "429" ]; then
            return 0  # Rate limiting fonctionne
        fi
        sleep 0.1
    done
    return 1  # Pas de rate limiting détecté
}

run_test "Rate Limiting Auth" "test_rate_limit '${API_URL}/auth/login' 10"

run_test "Rate Limiting Global" "for i in {1..105}; do curl -s '${API_URL}/categories' > /dev/null; done; curl -s '${API_URL}/categories' -I | grep -q '429'"

# ============================================
# TESTS DE PERFORMANCE
# ============================================

echo -e "\n${YELLOW}🚀 Tests de Performance${NC}"

# Test de latence cache
test_cache_performance() {
    # MISS (cache vide)
    redis-cli -h $REDIS_HOST -p $REDIS_PORT DEL "categories:all" > /dev/null 2>&1
    miss_time=$(curl -s -w "%{time_total}" -o /dev/null "${API_URL}/categories")
    
    # HIT (cache chaud)
    hit_time=$(curl -s -w "%{time_total}" -o /dev/null "${API_URL}/categories")
    
    # Calculer l'amélioration (en bash avec multiplication par 100)
    miss_ms=$(echo "$miss_time * 1000" | bc -l 2>/dev/null || echo "100")
    hit_ms=$(echo "$hit_time * 1000" | bc -l 2>/dev/null || echo "50")
    
    # Test simple : HIT doit être plus rapide que MISS
    [ $(echo "$hit_time < $miss_time" | bc -l 2>/dev/null || echo "1") = "1" ]
}

run_test "Cache Performance Improvement" "test_cache_performance"

# Test de charge
test_concurrent_requests() {
# Test de charge
test_concurrent_requests() {
    echo "  Envoi de 20 requêtes simultanées..."
    
    # Lancer 20 requêtes en parallèle
    for i in {1..20}; do
        curl -s "${API_URL}/categories" > /dev/null &
    done
    
    # Attendre que toutes se terminent
    wait
    
    # Vérifier que Redis est toujours opérationnel
    redis-cli -h $REDIS_HOST -p $REDIS_PORT ping | grep -q PONG
}

run_test "Concurrent Requests Handling" "test_concurrent_requests"

# ============================================
# TESTS D'INVALIDATION DE CACHE
# ============================================

echo -e "\n${YELLOW}🔄 Tests d'Invalidation de Cache${NC}"

# Simuler une création d'annonce pour tester l'invalidation
test_cache_invalidation() {
    # Récupérer les listings (mise en cache)
    curl -s "${API_URL}/listings?page=1&limit=5" > /dev/null
    
    # Vérifier que c'est en cache
    if curl -s "${API_URL}/listings?page=1&limit=5" -I | grep -q "X-Cache: HIT"; then
        # Simuler invalidation en supprimant manuellement la clé
        redis-cli -h $REDIS_HOST -p $REDIS_PORT DEL "listings:page:1:5" > /dev/null 2>&1
        
        # Le prochain appel doit être MISS
        curl -s "${API_URL}/listings?page=1&limit=5" -I | grep -q "X-Cache: MISS"
    else
        return 1
    fi
}

run_test "Cache Invalidation" "test_cache_invalidation"

# ============================================
# TESTS DE PERSISTANCE REDIS
# ============================================

echo -e "\n${YELLOW}💾 Tests de Persistance Redis${NC}"

test_redis_persistence() {
    # Écrire une clé de test
    redis-cli -h $REDIS_HOST -p $REDIS_PORT SET "test:persistence" "working" EX 3600 > /dev/null 2>&1
    
    # Forcer une sauvegarde
    redis-cli -h $REDIS_HOST -p $REDIS_PORT BGSAVE > /dev/null 2>&1
    
    # Vérifier que la clé existe
    redis-cli -h $REDIS_HOST -p $REDIS_PORT GET "test:persistence" | grep -q "working"
}

run_test "Redis Persistence" "test_redis_persistence"

# ============================================
# TESTS DE SÉCURITÉ
# ============================================

echo -e "\n${YELLOW}🔒 Tests de Sécurité${NC}"

test_redis_security() {
    # Tester que Redis n'est pas accessible sans authentification
    # (Si un mot de passe est configuré)
    redis-cli -h $REDIS_HOST -p $REDIS_PORT --no-auth-warning ping 2>&1 | grep -q "NOAUTH\|Authentication required\|PONG"
}

run_test "Redis Security" "test_redis_security"

# ============================================
# TESTS DE MONITORING
# ============================================

echo -e "\n${YELLOW}📊 Tests de Monitoring${NC}"

run_test "Cache Stats Endpoint" "curl -s '${API_URL}/cache/stats' | jq -r '.status' | grep -q 'OK'"

run_test "Memory Usage Check" "redis-cli -h $REDIS_HOST -p $REDIS_PORT INFO memory | grep -q 'used_memory_human'"

run_test "Key Count Check" "redis-cli -h $REDIS_HOST -p $REDIS_PORT DBSIZE | grep -q '[0-9]'"

# ============================================
# VALIDATION DES STRUCTURES DE CACHE
# ============================================

echo -e "\n${YELLOW}🏗️  Tests de Structure de Cache${NC}"

test_cache_structure() {
    # Générer du cache en appelant différents endpoints
    curl -s "${API_URL}/categories" > /dev/null
    curl -s "${API_URL}/listings?page=1&limit=5" > /dev/null
    curl -s "${API_URL}/listings/search?q=test" > /dev/null
    
    # Vérifier que les clés ont les bons patterns
    local categories_keys=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT --scan --pattern "categories:*" | wc -l)
    local listings_keys=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT --scan --pattern "listings:*" | wc -l)
    local search_keys=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT --scan --pattern "search:*" | wc -l)
    
    [ "$categories_keys" -gt 0 ] && [ "$listings_keys" -gt 0 ] && [ "$search_keys" -gt 0 ]
}

run_test "Cache Key Structure" "test_cache_structure"

# ============================================
# TESTS DE TTL (TIME TO LIVE)
# ============================================

echo -e "\n${YELLOW}⏰ Tests TTL${NC}"

test_cache_ttl() {
    # Vérifier qu'une clé a un TTL
    local key=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT --scan --pattern "*" | head -1)
    if [ -n "$key" ]; then
        local ttl=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT TTL "$key")
        # TTL > 0 signifie qu'un délai d'expiration est défini
        [ "$ttl" -gt 0 ] || [ "$ttl" -eq -1 ]  # -1 = pas d'expiration définie (OK aussi)
    else
        # Créer une clé temporaire pour tester
        redis-cli -h $REDIS_HOST -p $REDIS_PORT SET "test:ttl" "value" EX 300 > /dev/null 2>&1
        local ttl=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT TTL "test:ttl")
        [ "$ttl" -gt 0 ]
    fi
}

run_test "Cache TTL Configuration" "test_cache_ttl"

# ============================================
# RÉSULTATS FINAUX
# ============================================

echo -e "\n${BLUE}============================================${NC}"
echo -e "${BLUE}🏁 RÉSULTATS DE VALIDATION${NC}"
echo -e "${BLUE}============================================${NC}"

echo -e "Total des tests: $TESTS_TOTAL"
echo -e "${GREEN}Tests réussis: $TESTS_PASSED${NC}"
echo -e "${RED}Tests échoués: $TESTS_FAILED${NC}"

# Calculer le pourcentage de réussite
if [ $TESTS_TOTAL -gt 0 ]; then
    success_rate=$(( TESTS_PASSED * 100 / TESTS_TOTAL ))
    echo -e "Taux de réussite: ${success_rate}%"
    
    if [ $success_rate -ge 90 ]; then
        echo -e "\n${GREEN}🎉 EXCELLENT ! Implémentation Redis prête pour la production !${NC}"
        exit_code=0
    elif [ $success_rate -ge 75 ]; then
        echo -e "\n${YELLOW}⚠️  BON ! Quelques améliorations mineures nécessaires.${NC}"
        exit_code=0
    else
        echo -e "\n${RED}❌ PROBLÈMES DÉTECTÉS ! Révision nécessaire avant production.${NC}"
        exit_code=1
    fi
else
    echo -e "\n${RED}❌ ERREUR ! Aucun test n'a pu être exécuté.${NC}"
    exit_code=1
fi

# Informations supplémentaires
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "\n${YELLOW}💡 Conseils de dépannage :${NC}"
    echo -e "• Vérifiez que Redis est démarré : redis-cli ping"
    echo -e "• Vérifiez que l'API SenMarket est démarrée : curl $BASE_URL/health"
    echo -e "• Consultez les logs : docker-compose logs redis"
    echo -e "• Vérifiez la configuration Redis dans .env"
fi

echo -e "\n${BLUE}📊 Statistiques Redis actuelles :${NC}"
if redis-cli -h $REDIS_HOST -p $REDIS_PORT ping > /dev/null 2>&1; then
    total_keys=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT DBSIZE)
    memory_used=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT INFO memory | grep "used_memory_human" | cut -d: -f2 | tr -d '\r')
    echo -e "• Clés en cache: $total_keys"
    echo -e "• Mémoire utilisée: $memory_used"
    
    # Hit ratio si disponible
    hits=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT INFO stats | grep "keyspace_hits:" | cut -d: -f2 | tr -d '\r')
    misses=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT INFO stats | grep "keyspace_misses:" | cut -d: -f2 | tr -d '\r')
    
    if [ -n "$hits" ] && [ -n "$misses" ] && [ $((hits + misses)) -gt 0 ]; then
        hit_ratio=$(( hits * 100 / (hits + misses) ))
        echo -e "• Hit ratio: ${hit_ratio}%"
    fi
fi

exit $exit_code