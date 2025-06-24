# ============================================
# 5. SCRIPT: scripts/redis_monitor.sh
# ============================================

#!/bin/bash

echo "🔴 Monitoring Redis SenMarket"
echo "=============================="

# Connexion à Redis et affichage des stats
redis-cli -h localhost -p 6379 -a "your-redis-password-here" <<EOF
INFO memory
INFO stats
INFO clients
DBSIZE
KEYS *listing*
KEYS *cache*
KEYS *search*
EOF

echo ""
echo "🔴 Top 10 clés les plus utilisées:"
redis-cli -h localhost -p 6379 -a "your-redis-password-here" --scan --pattern "*" | head -10

echo ""
echo "🔴 Statistiques cache par type:"
echo "Listings: $(redis-cli -h localhost -p 6379 -a 'your-redis-password-here' --scan --pattern 'listing:*' | wc -l)"
echo "Categories: $(redis-cli -h localhost -p 6379 -a 'your-redis-password-here' --scan --pattern 'category:*' | wc -l)"
echo "Search: $(redis-cli -h localhost -p 6379 -a 'your-redis-password-here' --scan --pattern 'search:*' | wc -l)"
echo "Sessions: $(redis-cli -h localhost -p 6379 -a 'your-redis-password-here' --scan --pattern 'session:*' | wc -l)"