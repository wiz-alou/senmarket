// ============================================
// 4. SCRIPT: scripts/redis_backup.sh
// ============================================
#!/bin/bash

echo "💾 Backup Redis SenMarket"
echo "========================"

# Configuration
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASS="your-redis-password-here"
BACKUP_DIR="./backups/redis"
DATE=$(date +%Y%m%d_%H%M%S)

# Créer le dossier de backup
mkdir -p $BACKUP_DIR

# Sauvegarder la base Redis
echo "📦 Création du backup Redis..."
redis-cli -h $REDIS_HOST -p $REDIS_PORT -a "$REDIS_PASS" --rdb "${BACKUP_DIR}/senmarket_${DATE}.rdb"

# Exporter les clés importantes
echo "🔑 Export des clés critiques..."
redis-cli -h $REDIS_HOST -p $REDIS_PORT -a "$REDIS_PASS" --scan --pattern "categories:*" > "${BACKUP_DIR}/categories_keys_${DATE}.txt"
redis-cli -h $REDIS_HOST -p $REDIS_PORT -a "$REDIS_PASS" --scan --pattern "stats:*" > "${BACKUP_DIR}/stats_keys_${DATE}.txt"

# Compression
echo "🗜️  Compression du backup..."
tar -czf "${BACKUP_DIR}/senmarket_redis_backup_${DATE}.tar.gz" -C $BACKUP_DIR senmarket_${DATE}.rdb categories_keys_${DATE}.txt stats_keys_${DATE}.txt

# Nettoyage des fichiers temporaires
rm "${BACKUP_DIR}/senmarket_${DATE}.rdb" "${BACKUP_DIR}/categories_keys_${DATE}.txt" "${BACKUP_DIR}/stats_keys_${DATE}.txt"

echo "✅ Backup créé: ${BACKUP_DIR}/senmarket_redis_backup_${DATE}.tar.gz"

# Nettoyage des anciens backups (garder seulement les 7 derniers)
echo "🧹 Nettoyage des anciens backups..."
find $BACKUP_DIR -name "senmarket_redis_backup_*.tar.gz" -mtime +7 -delete

echo "💾 Backup Redis terminé !"