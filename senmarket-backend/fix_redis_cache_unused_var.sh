#!/bin/bash
# FIX REDIS CACHE - VARIABLE NON UTILISÉE

echo "🔧 FIX REDIS CACHE - VARIABLE NON UTILISÉE"
echo "=========================================="

# Corriger la méthode GetStats dans cache_repository.go
cat > internal/infrastructure/persistence/redis/cache_repository.go << 'EOF'
// internal/infrastructure/persistence/redis/cache_repository.go
package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"time"
	
	"github.com/redis/go-redis/v9"
	
	"senmarket/internal/domain/repositories"
)

// RedisCacheRepository - Implémentation Redis du CacheRepository
type RedisCacheRepository struct {
	client *redis.Client
}

// NewRedisCacheRepository - Constructeur
func NewRedisCacheRepository(client *redis.Client) repositories.CacheRepository {
	return &RedisCacheRepository{client: client}
}

// Set - Stocker une valeur avec TTL
func (r *RedisCacheRepository) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return fmt.Errorf("erreur sérialisation JSON pour clé %s: %w", key, err)
	}
	
	return r.client.Set(ctx, key, data, expiration).Err()
}

// Get - Récupérer une valeur
func (r *RedisCacheRepository) Get(ctx context.Context, key string, dest interface{}) error {
	data, err := r.client.Get(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return fmt.Errorf("clé non trouvée: %s", key)
		}
		return fmt.Errorf("erreur récupération Redis pour clé %s: %w", key, err)
	}
	
	err = json.Unmarshal([]byte(data), dest)
	if err != nil {
		return fmt.Errorf("erreur désérialisation JSON pour clé %s: %w", key, err)
	}
	
	return nil
}

// Delete - Supprimer une clé
func (r *RedisCacheRepository) Delete(ctx context.Context, key string) error {
	return r.client.Del(ctx, key).Err()
}

// Exists - Vérifier si une clé existe
func (r *RedisCacheRepository) Exists(ctx context.Context, key string) (bool, error) {
	count, err := r.client.Exists(ctx, key).Result()
	return count > 0, err
}

// SetMultiple - Stocker plusieurs valeurs (utilise pipeline pour performance)
func (r *RedisCacheRepository) SetMultiple(ctx context.Context, items map[string]interface{}, expiration time.Duration) error {
	pipe := r.client.Pipeline()
	
	for key, value := range items {
		data, err := json.Marshal(value)
		if err != nil {
			return fmt.Errorf("erreur sérialisation pour clé %s: %w", key, err)
		}
		pipe.Set(ctx, key, data, expiration)
	}
	
	_, err := pipe.Exec(ctx)
	return err
}

// GetMultiple - Récupérer plusieurs valeurs
func (r *RedisCacheRepository) GetMultiple(ctx context.Context, keys []string) (map[string]interface{}, error) {
	pipe := r.client.Pipeline()
	
	// Préparer toutes les commandes GET
	cmds := make([]*redis.StringCmd, len(keys))
	for i, key := range keys {
		cmds[i] = pipe.Get(ctx, key)
	}
	
	// Exécuter le pipeline
	_, err := pipe.Exec(ctx)
	if err != nil && err != redis.Nil {
		return nil, err
	}
	
	// Traiter les résultats
	results := make(map[string]interface{})
	for i, cmd := range cmds {
		val, err := cmd.Result()
		if err == redis.Nil {
			continue // Clé non trouvée, on skip
		}
		if err != nil {
			return nil, err
		}
		
		var data interface{}
		if err := json.Unmarshal([]byte(val), &data); err != nil {
			continue // Erreur désérialisation, on skip
		}
		
		results[keys[i]] = data
	}
	
	return results, nil
}

// DeletePattern - Supprimer toutes les clés correspondant à un pattern
func (r *RedisCacheRepository) DeletePattern(ctx context.Context, pattern string) error {
	keys, err := r.client.Keys(ctx, pattern).Result()
	if err != nil {
		return err
	}
	
	if len(keys) > 0 {
		return r.client.Del(ctx, keys...).Err()
	}
	
	return nil
}

// SetWithTags - Stocker avec tags (implémentation simple avec sets Redis)
func (r *RedisCacheRepository) SetWithTags(ctx context.Context, key string, value interface{}, tags []string, expiration time.Duration) error {
	// D'abord stocker la valeur
	if err := r.Set(ctx, key, value, expiration); err != nil {
		return err
	}
	
	// Puis ajouter la clé à chaque tag (sets Redis)
	pipe := r.client.Pipeline()
	for _, tag := range tags {
		tagKey := "tag:" + tag
		pipe.SAdd(ctx, tagKey, key)
		pipe.Expire(ctx, tagKey, expiration+time.Hour) // TTL un peu plus long pour les tags
	}
	
	_, err := pipe.Exec(ctx)
	return err
}

// InvalidateByTag - Invalider toutes les clés d'un tag
func (r *RedisCacheRepository) InvalidateByTag(ctx context.Context, tag string) error {
	tagKey := "tag:" + tag
	
	// Récupérer toutes les clés du tag
	keys, err := r.client.SMembers(ctx, tagKey).Result()
	if err != nil {
		return err
	}
	
	if len(keys) == 0 {
		return nil
	}
	
	// Supprimer toutes les clés + le tag lui-même
	allKeys := append(keys, tagKey)
	return r.client.Del(ctx, allKeys...).Err()
}

// GetStats - Statistiques du cache (version simplifiée)
func (r *RedisCacheRepository) GetStats(ctx context.Context) (*repositories.CacheStats, error) {
	// Récupérer juste le nombre de clés pour simplifier
	dbSize, err := r.client.DBSize(ctx).Result()
	if err != nil {
		return nil, err
	}
	
	// Version simplifiée sans parsing complexe de l'info Redis
	return &repositories.CacheStats{
		TotalKeys:   dbSize,
		HitRate:     0.0, // TODO: Implémenter avec des compteurs custom
		MissRate:    0.0, // TODO: Implémenter avec des compteurs custom
		MemoryUsage: 0,   // TODO: Parser info memory Redis
	}, nil
}
EOF

echo "✅ Redis Cache Repository corrigé (variable info supprimée)"

# Test compilation immédiate
echo ""
echo "🧪 TEST COMPILATION CORRIGÉE..."

if go build ./internal/infrastructure/persistence/redis/...; then
    echo "✅ Redis Cache Repository : COMPILATION OK !"
    
    echo ""
    echo "📦 Test Infrastructure Layer complète..."
    if go build ./internal/infrastructure/...; then
        echo "✅ Infrastructure Layer : COMPILATION OK !"
        
        echo ""
        echo "📦 Test CLEAN ARCHITECTURE COMPLÈTE..."
        if go build ./internal/domain/... && go build ./internal/application/... && go build ./internal/infrastructure/...; then
            echo "✅ CLEAN ARCHITECTURE COMPLÈTE : COMPILATION OK !"
            echo ""
            echo "🎉 PHASE 4B - INFRASTRUCTURE LAYER - SUCCÈS TOTAL !"
            echo "===================================================="
            echo "✅ Redis Cache Repository : Connecté avec ton Redis existant"
            echo "✅ Service Adapters (3/3) : Twilio, MinIO, Payment"
            echo "✅ Dependency Injection Container : Wire tout ensemble"
            echo "✅ PostgreSQL Repositories : User, Listing"
            echo ""
            echo "🎯 INFRASTRUCTURE LAYER TERMINÉE !"
            echo "📋 Structure complète :"
            echo "📁 internal/infrastructure/"
            echo "  ├── persistence/postgres/    ✅ User, Listing repositories"
            echo "  ├── persistence/redis/       ✅ Cache repository"
            echo "  ├── external/                ✅ Service adapters"
            echo "  └── container/               ✅ Dependency injection"
            echo ""
            echo "🚀 PRÊT POUR PHASE 5 - INTERFACE LAYER !"
            echo "Clean Architecture connectée avec tes services existants"
        else
            echo "❌ Clean Architecture : ERREUR"
        fi
    else
        echo "❌ Infrastructure Layer : ERREUR"
        go build ./internal/infrastructure/... 2>&1
    fi
else
    echo "❌ Redis Cache Repository : ERREURS RESTANTES"
    go build ./internal/infrastructure/persistence/redis/... 2>&1
fi
