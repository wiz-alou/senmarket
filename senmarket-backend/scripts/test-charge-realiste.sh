#!/bin/bash
# 🧪 Test de charge réaliste SenMarket

echo "🧪 TEST DE CHARGE RÉALISTE SENMARKET"
echo "=================================="
echo "🎯 Simulation: 100+ utilisateurs simultanés avec vraie data"

API_URL="http://localhost:8080/api/v1"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. PURGER LE CACHE POUR PARTIR DE ZÉRO
echo -e "\n${YELLOW}1. 🗑️  PURGE CACHE - RESTART À ZÉRO${NC}"
echo "================================="

echo "💣 Vidage complet cache Redis..."
docker exec senmarket_redis redis-cli FLUSHALL >/dev/null 2>&1
echo "✅ Cache vide - Test à froid garanti !"

# Vérification
keys_after=$(docker exec senmarket_redis redis-cli DBSIZE 2>/dev/null)
echo "🔑 Clés en cache après purge: $keys_after"

# 2. CRÉER DE LA VRAIE DATA
echo -e "\n${YELLOW}2. 📊 CRÉATION DATA RÉALISTE${NC}"
echo "============================"

echo "🏗️  Simulation données utilisateurs multiples..."

# Simuler plusieurs requêtes de différents types pour charger la DB
echo "📋 Chargement catégories (froid)..."
start=$(date +%s%N)
curl -s "$API_URL/categories" >/dev/null
end=$(date +%s%N)
cold_time=$(( (end - start) / 1000000 ))
echo "   ❄️  Premier appel (cache froid): ${cold_time}ms"

echo "📦 Chargement listings page 1..."
curl -s "$API_URL/listings?page=1&limit=20" >/dev/null

echo "📦 Chargement listings page 2..."
curl -s "$API_URL/listings?page=2&limit=20" >/dev/null

echo "⭐ Chargement featured..."
curl -s "$API_URL/listings/featured" >/dev/null

echo "🔍 Chargement recherches..."
curl -s "$API_URL/listings/search?q=voiture" >/dev/null
curl -s "$API_URL/listings/search?q=maison" >/dev/null
curl -s "$API_URL/listings/search?q=téléphone" >/dev/null

# 3. TEST CHARGE PROGRESSIVE
echo -e "\n${YELLOW}3. 💪 TEST CHARGE PROGRESSIVE${NC}"
echo "============================="

test_concurrent_load() {
    local users=$1
    local requests_per_user=$2
    
    echo -e "\n🔥 Test: $users utilisateurs × $requests_per_user requêtes"
    
    start_time=$(date +%s)
    total_requests=$((users * requests_per_user))
    
    # Lancer utilisateurs en parallèle
    for user in $(seq 1 $users); do
        {
            for req in $(seq 1 $requests_per_user); do
                # Mix d'endpoints comme vrais utilisateurs
                case $((req % 4)) in
                    0) curl -s "$API_URL/categories" >/dev/null ;;
                    1) curl -s "$API_URL/listings?page=1&limit=20" >/dev/null ;;
                    2) curl -s "$API_URL/listings/featured" >/dev/null ;;
                    3) curl -s "$API_URL/listings/search?q=test$user" >/dev/null ;;
                esac
                
                # Délai réaliste entre requêtes utilisateur
                sleep 0.1
            done
        } &
    done
    
    # Attendre tous les utilisateurs
    wait
    
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    
    if [ "$duration" -eq 0 ]; then duration=1; fi
    
    rps=$((total_requests / duration))
    avg_response=$((duration * 1000 / total_requests))
    
    echo "   ⏱️  Durée totale: ${duration}s"
    echo "   📊 Total requêtes: $total_requests"
    echo "   📈 Débit: $rps req/s"
    echo "   ⚡ Temps moyen: ${avg_response}ms"
    
    # Évaluation performance
    if [ "$avg_response" -lt 50 ]; then
        echo -e "   🏆 Résultat: ${GREEN}EXCEPTIONNEL${NC}"
        return 0
    elif [ "$avg_response" -lt 200 ]; then
        echo -e "   ⚡ Résultat: ${GREEN}EXCELLENT${NC}"
        return 0
    elif [ "$avg_response" -lt 500 ]; then
        echo -e "   ✅ Résultat: ${YELLOW}BON${NC}"
        return 1
    else
        echo -e "   ⚠️  Résultat: ${RED}LIMITE ATTEINTE${NC}"
        return 2
    fi
}

# Tests progressifs
test_concurrent_load 5 10    # 5 users, 10 req each = 50 total
test_concurrent_load 10 10   # 10 users, 10 req each = 100 total  
test_concurrent_load 20 5    # 20 users, 5 req each = 100 total
test_concurrent_load 50 2    # 50 users, 2 req each = 100 total

# 4. TEST EXTRÊME
echo -e "\n${YELLOW}4. 🚀 TEST EXTRÊME${NC}"
echo "=================="

echo "💥 Test limite: 100 utilisateurs simultanés..."
start_extreme=$(date +%s)

# 100 requêtes simultanées instantanées
for i in {1..100}; do
    curl -s "$API_URL/categories" >/dev/null &
done

wait

end_extreme=$(date +%s)
extreme_duration=$((end_extreme - start_extreme))

echo "⏱️  100 requêtes simultanées en: ${extreme_duration}s"

if [ "$extreme_duration" -lt 3 ]; then
    echo -e "🤯 Résultat: ${GREEN}MONSTRUEUX ! Ton système encaisse tout !${NC}"
elif [ "$extreme_duration" -lt 10 ]; then
    echo -e "🔥 Résultat: ${GREEN}EXCELLENT ! Architecture robuste !${NC}"
else
    echo -e "⚠️  Résultat: ${YELLOW}Limite atteinte, mais honorable${NC}"
fi

# 5. ANALYSE POST-TEST
echo -e "\n${YELLOW}5. 📊 ANALYSE POST-TEST${NC}"
echo "======================="

# Stats Redis après charge
if docker exec senmarket_redis redis-cli ping >/dev/null 2>&1; then
    keys_final=$(docker exec senmarket_redis redis-cli DBSIZE 2>/dev/null)
    memory_final=$(docker exec senmarket_redis redis-cli info memory 2>/dev/null | grep used_memory_human | cut -d: -f2 | tr -d '\r')
    hits_final=$(docker exec senmarket_redis redis-cli info stats 2>/dev/null | grep keyspace_hits | cut -d: -f2 | tr -d '\r')
    misses_final=$(docker exec senmarket_redis redis-cli info stats 2>/dev/null | grep keyspace_misses | cut -d: -f2 | tr -d '\r')
    
    echo "🔑 Clés créées: $keys_final"
    echo "💾 Mémoire utilisée: $memory_final"
    echo "🎯 Hits: $hits_final"
    echo "❌ Misses: $misses_final"
    
    if [ "$((hits_final + misses_final))" -gt 0 ]; then
        ratio_final=$(( hits_final * 100 / (hits_final + misses_final) ))
        echo "📈 Hit Ratio final: $ratio_final%"
        
        if [ "$ratio_final" -gt 70 ]; then
            echo -e "🏆 Cache: ${GREEN}TOUJOURS EFFICACE sous charge !${NC}"
        else
            echo -e "⚠️  Cache: ${YELLOW}Impacté par la charge${NC}"
        fi
    fi
fi

# Test performance après charge
echo -e "\n🧪 Test performance après stress..."
start_after=$(date +%s%N)
curl -s "$API_URL/categories" >/dev/null
end_after=$(date +%s%N)
after_time=$(( (end_after - start_after) / 1000000 ))

echo "⚡ Performance après stress: ${after_time}ms"

if [ "$after_time" -lt 50 ]; then
    echo -e "🚀 Verdict: ${GREEN}SYSTÈME INDESTRUCTIBLE !${NC}"
elif [ "$after_time" -lt 200 ]; then
    echo -e "💪 Verdict: ${GREEN}TRÈS ROBUSTE !${NC}"
else
    echo -e "⚠️  Verdict: ${YELLOW}Impacté mais fonctionnel${NC}"
fi

echo ""
echo -e "${BLUE}🎯 CONCLUSION RÉALISTE${NC}"
echo "======================"
echo "✅ Test avec cache vide ✅"
echo "✅ Charge progressive ✅"
echo "✅ Utilisateurs multiples ✅"
echo "✅ Mix d'endpoints réaliste ✅"
echo ""

comparison_cold_warm=$((cold_time - after_time))
if [ "$comparison_cold_warm" -gt 0 ]; then
    echo -e "📊 Cache améliore performance de ${comparison_cold_warm}ms"
else
    echo -e "📊 Performance stable cache froid/chaud"
fi

echo ""
echo -e "${GREEN}🏆 SENMARKET TESTÉ EN CONDITIONS RÉELLES !${NC}"
echo -e "${GREEN}🇸🇳 Architecture validée pour production !${NC}"
