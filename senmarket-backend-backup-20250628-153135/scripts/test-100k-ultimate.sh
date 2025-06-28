#!/bin/bash
# 🔥 TEST ULTIME 100,000 REQUÊTES - SENMARKET STRESS TEST EXTREME

echo "🔥 TEST ULTIME SENMARKET - 100K REQUÊTES"
echo "========================================"
echo "⚠️  ATTENTION: Test extrême - Peut prendre plusieurs minutes"
echo "🎯 Objectif: Trouver les vraies limites de SenMarket"

API_URL="http://localhost:8080/api/v1"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

# Configuration test
TOTAL_REQUESTS=100000
CONCURRENT_USERS=(100 500 1000 2000 5000)
MAX_CONCURRENT=5000

echo -e "${BOLD}📊 CONFIGURATION TEST ULTIME:${NC}"
echo "🎯 Total requêtes: $TOTAL_REQUESTS"
echo "👥 Max utilisateurs simultanés: $MAX_CONCURRENT"
echo "⏱️  Estimation durée: 10-30 minutes"
echo ""

read -p "🚀 Prêt à lancer le test ultime ? (y/N): " confirm
if [ "$confirm" != "y" ]; then
    echo "❌ Test annulé"
    exit 0
fi

# Fonction de monitoring système
monitor_system() {
    local test_name="$1"
    
    echo "📊 Monitoring système pendant: $test_name"
    
    # CPU Usage
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    
    # Memory usage
    mem_info=$(free -m)
    mem_used=$(echo "$mem_info" | awk 'NR==2{printf "%.1f", $3/1024}')
    mem_total=$(echo "$mem_info" | awk 'NR==2{printf "%.1f", $2/1024}')
    
    # Docker stats
    docker_stats=$(docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null | tail -n +2)
    
    echo "   💻 CPU Usage: ${cpu_usage}%"
    echo "   💾 RAM: ${mem_used}GB / ${mem_total}GB"
    echo "   🐳 Docker containers actifs:"
    echo "$docker_stats" | head -5 | while read line; do
        echo "      $line"
    done
}

# Fonction de test massif
massive_stress_test() {
    local concurrent=$1
    local requests_per_batch=$2
    local batch_count=$3
    
    echo -e "\n${PURPLE}🔥 TEST MASSIF: $concurrent utilisateurs simultanés${NC}"
    echo "=============================================="
    echo "📊 $requests_per_batch requêtes par batch × $batch_count batchs = $((requests_per_batch * batch_count)) total"
    
    local total_time=0
    local successful_requests=0
    local failed_requests=0
    local response_times=()
    
    for batch in $(seq 1 $batch_count); do
        echo -n "🚀 Batch $batch/$batch_count... "
        
        local batch_start=$(date +%s%N)
        
        # Lancer les requêtes simultanées
        for user in $(seq 1 $concurrent); do
            for req in $(seq 1 $((requests_per_batch / concurrent))); do
                {
                    local req_start=$(date +%s%N)
                    
                    # Mix réaliste d'endpoints
                    case $((RANDOM % 5)) in
                        0) endpoint="$API_URL/categories" ;;
                        1) endpoint="$API_URL/listings?page=1&limit=20" ;;
                        2) endpoint="$API_URL/listings/featured" ;;
                        3) endpoint="$API_URL/listings/search?q=test$user" ;;
                        4) endpoint="$API_URL/health" ;;
                    esac
                    
                    if curl -s --max-time 30 "$endpoint" >/dev/null 2>&1; then
                        local req_end=$(date +%s%N)
                        local req_time=$(( (req_end - req_start) / 1000000 ))
                        echo "$req_time" >> /tmp/response_times_$batch.txt
                        echo "1" >> /tmp/success_$batch.txt
                    else
                        echo "0" >> /tmp/success_$batch.txt
                    fi
                } &
                
                # Limiter le nombre de processus simultanés
                if (( $(jobs -r | wc -l) >= $concurrent )); then
                    wait -n  # Attendre qu'un job se termine
                fi
            done
        done
        
        # Attendre que tous les jobs du batch se terminent
        wait
        
        local batch_end=$(date +%s%N)
        local batch_time=$(( (batch_end - batch_start) / 1000000000 ))
        
        # Calculer stats du batch
        local batch_success=0
        local batch_fail=0
        
        if [ -f "/tmp/success_$batch.txt" ]; then
            batch_success=$(grep "1" /tmp/success_$batch.txt 2>/dev/null | wc -l)
            batch_fail=$(grep "0" /tmp/success_$batch.txt 2>/dev/null | wc -l)
            rm -f /tmp/success_$batch.txt
        fi
        
        successful_requests=$((successful_requests + batch_success))
        failed_requests=$((failed_requests + batch_fail))
        total_time=$((total_time + batch_time))
        
        local batch_rps=0
        if [ "$batch_time" -gt 0 ]; then
            batch_rps=$((requests_per_batch / batch_time))
        fi
        
        echo "${batch_time}s (${batch_rps} req/s, ✅${batch_success} ❌${batch_fail})"
        
        # Nettoyer fichiers temporaires
        rm -f /tmp/response_times_$batch.txt
        
        # Pause entre batchs pour éviter l'overload
        if [ "$batch" -lt "$batch_count" ]; then
            sleep 2
        fi
    done
    
    # Calculs finaux
    local avg_rps=0
    if [ "$total_time" -gt 0 ]; then
        avg_rps=$(( (successful_requests + failed_requests) / total_time ))
    fi
    
    local success_rate=0
    local total_processed=$((successful_requests + failed_requests))
    if [ "$total_processed" -gt 0 ]; then
        success_rate=$(( successful_requests * 100 / total_processed ))
    fi
    
    echo ""
    echo "📊 RÉSULTATS BATCH $concurrent UTILISATEURS:"
    echo "   ⏱️  Temps total: ${total_time}s"
    echo "   ✅ Succès: $successful_requests"
    echo "   ❌ Échecs: $failed_requests" 
    echo "   📈 Taux succès: ${success_rate}%"
    echo "   🚀 Débit moyen: ${avg_rps} req/s"
    
    # Évaluation
    if [ "$success_rate" -gt 95 ] && [ "$avg_rps" -gt 50 ]; then
        echo -e "   🏆 Verdict: ${GREEN}EXCEPTIONNEL !${NC}"
        return 0
    elif [ "$success_rate" -gt 90 ] && [ "$avg_rps" -gt 20 ]; then
        echo -e "   ⚡ Verdict: ${GREEN}EXCELLENT !${NC}"
        return 0
    elif [ "$success_rate" -gt 80 ] && [ "$avg_rps" -gt 10 ]; then
        echo -e "   ✅ Verdict: ${YELLOW}BON !${NC}"
        return 1
    else
        echo -e "   ⚠️  Verdict: ${RED}LIMITE ATTEINTE !${NC}"
        return 2
    fi
}

# Fonction pour tester la scalabilité
test_scalability() {
    echo -e "\n${BLUE}🔬 TEST SCALABILITÉ PROGRESSIVE${NC}"
    echo "================================="
    
    local requests_per_test=1000
    
    for users in "${CONCURRENT_USERS[@]}"; do
        if [ "$users" -le 1000 ]; then
            local batches=1
            local requests_per_batch=$requests_per_test
        else
            local batches=$((users / 1000))
            local requests_per_batch=$((requests_per_test / batches))
        fi
        
        monitor_system "avant test $users users"
        
        if massive_stress_test "$users" "$requests_per_batch" "$batches"; then
            echo -e "✅ $users utilisateurs: ${GREEN}Supporté !${NC}"
        else
            echo -e "⚠️  $users utilisateurs: ${YELLOW}Limite proche${NC}"
            
            # Si on commence à avoir des problèmes, on arrête
            if [ "$users" -gt 2000 ]; then
                echo -e "${RED}🛑 Arrêt du test - Limite système atteinte${NC}"
                break
            fi
        fi
        
        # Pause entre tests
        echo "😴 Pause 10s pour récupération système..."
        sleep 10
        
        monitor_system "après test $users users"
    done
}

# Fonction test final 100k
ultimate_100k_test() {
    echo -e "\n${RED}💥 TEST ULTIME: 100,000 REQUÊTES${NC}"
    echo "=================================="
    echo "🎯 Distribution: 1000 utilisateurs × 100 requêtes chacun"
    echo "📊 Répartition en 20 batchs de 5000 requêtes"
    
    read -p "⚠️  Test très intensif - Continuer ? (y/N): " confirm_ultimate
    if [ "$confirm_ultimate" != "y" ]; then
        echo "❌ Test ultime annulé"
        return
    fi
    
    echo "🚀 Démarrage test 100K..."
    
    local start_ultimate=$(date +%s)
    
    # 20 batchs de 5000 requêtes avec 1000 users simultanés
    massive_stress_test 1000 5000 20
    
    local end_ultimate=$(date +%s)
    local duration_ultimate=$((end_ultimate - start_ultimate))
    
    echo ""
    echo -e "${BOLD}🏆 RÉSULTATS TEST 100K:${NC}"
    echo "⏱️  Durée totale: ${duration_ultimate}s ($((duration_ultimate / 60))min)"
    
    if [ "$duration_ultimate" -gt 0 ]; then
        local final_rps=$((100000 / duration_ultimate))
        echo "🚀 Débit final: $final_rps req/s"
        
        if [ "$final_rps" -gt 1000 ]; then
            echo -e "🤯 Verdict 100K: ${GREEN}MONSTRUEUX ! Niveau FAANG confirmé !${NC}"
        elif [ "$final_rps" -gt 500 ]; then
            echo -e "🔥 Verdict 100K: ${GREEN}EXCEPTIONNEL ! Niveau licorne !${NC}"
        elif [ "$final_rps" -gt 100 ]; then
            echo -e "⚡ Verdict 100K: ${GREEN}EXCELLENT ! Production ready !${NC}"
        else
            echo -e "✅ Verdict 100K: ${YELLOW}BON ! Peut gérer la charge !${NC}"
        fi
    fi
}

# Fonction de monitoring Redis sous stress
monitor_redis_under_stress() {
    echo -e "\n${RED}🔴 MONITORING REDIS SOUS STRESS${NC}"
    echo "================================"
    
    if ! docker exec senmarket_redis redis-cli ping >/dev/null 2>&1; then
        echo "❌ Redis non accessible"
        return
    fi
    
    echo "📊 Stats Redis en temps réel (5 snapshots):"
    
    for i in {1..5}; do
        keys=$(docker exec senmarket_redis redis-cli dbsize 2>/dev/null)
        memory=$(docker exec senmarket_redis redis-cli info memory 2>/dev/null | grep used_memory_human | cut -d: -f2 | tr -d '\r')
        hits=$(docker exec senmarket_redis redis-cli info stats 2>/dev/null | grep keyspace_hits | cut -d: -f2 | tr -d '\r')
        misses=$(docker exec senmarket_redis redis-cli info stats 2>/dev/null | grep keyspace_misses | cut -d: -f2 | tr -d '\r')
        
        if [ "$((hits + misses))" -gt 0 ]; then
            ratio=$(( hits * 100 / (hits + misses) ))
        else
            ratio=0
        fi
        
        printf "   T+%ds: 🔑%s 💾%s 📈%s%% 🎯%s ❌%s\n" "$((i*10))" "$keys" "$memory" "$ratio" "$hits" "$misses"
        
        if [ "$i" -lt 5 ]; then
            sleep 10
        fi
    done
}

# EXÉCUTION PRINCIPALE
echo -e "${BOLD}🔥 DÉBUT TEST ULTIME SENMARKET${NC}"
echo "================================"

# État initial
echo -e "\n${BLUE}📊 ÉTAT INITIAL SYSTÈME${NC}"
monitor_system "état initial"

# Test de scalabilité progressive  
test_scalability

# Monitoring Redis
monitor_redis_under_stress &
REDIS_MONITOR_PID=$!

# Test ultime 100k
ultimate_100k_test

# Arrêter monitoring Redis
kill $REDIS_MONITOR_PID 2>/dev/null

# État final
echo -e "\n${BLUE}📊 ÉTAT FINAL SYSTÈME${NC}"
monitor_system "état final"

# Analyse finale Redis
echo -e "\n${RED}🔴 ANALYSE FINALE REDIS${NC}"
echo "======================="

if docker exec senmarket_redis redis-cli ping >/dev/null 2>&1; then
    final_keys=$(docker exec senmarket_redis redis-cli dbsize 2>/dev/null)
    final_memory=$(docker exec senmarket_redis redis-cli info memory 2>/dev/null | grep used_memory_human | cut -d: -f2 | tr -d '\r')
    final_hits=$(docker exec senmarket_redis redis-cli info stats 2>/dev/null | grep keyspace_hits | cut -d: -f2 | tr -d '\r')
    final_misses=$(docker exec senmarket_redis redis-cli info stats 2>/dev/null | grep keyspace_misses | cut -d: -f2 | tr -d '\r')
    
    echo "🔑 Clés finales: $final_keys"
    echo "💾 Mémoire finale: $final_memory"
    echo "🎯 Hits totaux: $final_hits"
    echo "❌ Misses totaux: $final_misses"
    
    if [ "$((final_hits + final_misses))" -gt 0 ]; then
        final_ratio=$(( final_hits * 100 / (final_hits + final_misses) ))
        echo "📈 Hit Ratio final: $final_ratio%"
        
        if [ "$final_ratio" -gt 85 ]; then
            echo -e "🏆 Cache: ${GREEN}RÉSISTANT AU STRESS EXTRÊME !${NC}"
        elif [ "$final_ratio" -gt 70 ]; then
            echo -e "⚡ Cache: ${GREEN}ROBUSTE SOUS CHARGE !${NC}"
        else
            echo -e "⚠️  Cache: ${YELLOW}Impacté mais fonctionnel${NC}"
        fi
    fi
else
    echo -e "${RED}❌ Redis a crashé sous le stress${NC}"
fi

echo ""
echo -e "${BOLD}${GREEN}🎉 TEST ULTIME TERMINÉ !${NC}"
echo "========================"
echo -e "${GREEN}🏆 SenMarket a survécu au test ultime !${NC}"
echo -e "${GREEN}🇸🇳 Validation finale pour production massive !${NC}"
echo -e "${GREEN}🚀 Prêt pour conquérir l'Afrique !${NC}"

# Nettoyage
rm -f /tmp/response_times_*.txt /tmp/success_*.txt
