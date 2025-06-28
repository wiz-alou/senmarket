// internal/repository/redis/cache_repository.go
package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type CacheRepository struct {
	client *redis.Client
}

func NewCacheRepository(client *redis.Client) *CacheRepository {
	return &CacheRepository{
		client: client,
	}
}

// Set stocke une valeur avec TTL
func (r *CacheRepository) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return fmt.Errorf("erreur marshalling: %w", err)
	}
	
	return r.client.Set(ctx, key, data, ttl).Err()
}

// Get récupère une valeur
func (r *CacheRepository) Get(ctx context.Context, key string, dest interface{}) error {
	data, err := r.client.Get(ctx, key).Result()
	if err != nil {
		return err
	}
	
	return json.Unmarshal([]byte(data), dest)
}

// Del supprime une ou plusieurs clés
func (r *CacheRepository) Del(ctx context.Context, keys ...string) error {
	return r.client.Del(ctx, keys...).Err()
}

// Exists vérifie si une clé existe
func (r *CacheRepository) Exists(ctx context.Context, key string) (bool, error) {
	count, err := r.client.Exists(ctx, key).Result()
	return count > 0, err
}

// SetNX set si la clé n'existe pas (atomic)
func (r *CacheRepository) SetNX(ctx context.Context, key string, value interface{}, ttl time.Duration) (bool, error) {
	data, err := json.Marshal(value)
	if err != nil {
		return false, fmt.Errorf("erreur marshalling: %w", err)
	}
	
	return r.client.SetNX(ctx, key, data, ttl).Result()
}

// Incr incrémente un compteur
func (r *CacheRepository) Incr(ctx context.Context, key string) (int64, error) {
	return r.client.Incr(ctx, key).Result()
}

// IncrEx incrémente avec TTL
func (r *CacheRepository) IncrEx(ctx context.Context, key string, ttl time.Duration) (int64, error) {
	pipe := r.client.Pipeline()
	incrCmd := pipe.Incr(ctx, key)
	pipe.Expire(ctx, key, ttl)
	_, err := pipe.Exec(ctx)
	
	if err != nil {
		return 0, err
	}
	
	return incrCmd.Val(), nil
}

// GetPattern récupère toutes les clés matchant un pattern
func (r *CacheRepository) GetPattern(ctx context.Context, pattern string) ([]string, error) {
	return r.client.Keys(ctx, pattern).Result()
}

// DelPattern supprime toutes les clés matchant un pattern
func (r *CacheRepository) DelPattern(ctx context.Context, pattern string) error {
	keys, err := r.client.Keys(ctx, pattern).Result()
	if err != nil {
		return err
	}
	
	if len(keys) > 0 {
		return r.client.Del(ctx, keys...).Err()
	}
	
	return nil
}

// SetHash stocke un hash
func (r *CacheRepository) SetHash(ctx context.Context, key string, fields map[string]interface{}) error {
	return r.client.HMSet(ctx, key, fields).Err()
}

// GetHash récupère un hash complet
func (r *CacheRepository) GetHash(ctx context.Context, key string) (map[string]string, error) {
	return r.client.HGetAll(ctx, key).Result()
}