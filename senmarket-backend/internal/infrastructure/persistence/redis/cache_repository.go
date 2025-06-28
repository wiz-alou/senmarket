// internal/infrastructure/persistence/redis/cache_repository.go
package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"
	"senmarket/internal/domain/repositories"
	"github.com/redis/go-redis/v9"
)

// CacheRepository implémentation Redis du repository cache
type CacheRepository struct {
	client *redis.Client
}

// NewCacheRepository crée un nouveau repository cache
func NewCacheRepository(client *redis.Client) repositories.CacheRepository {
	return &CacheRepository{
		client: client,
	}
}

// Set stocke une valeur dans le cache avec expiration
func (r *CacheRepository) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	return r.client.Set(ctx, key, value, expiration).Err()
}

// Get récupère une valeur du cache
func (r *CacheRepository) Get(ctx context.Context, key string) (interface{}, error) {
	val, err := r.client.Get(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return nil, nil
		}
		return nil, err
	}
	return val, nil
}

// GetString récupère une valeur string du cache
func (r *CacheRepository) GetString(ctx context.Context, key string) (string, error) {
	return r.client.Get(ctx, key).Result()
}

// GetInt récupère une valeur int du cache
func (r *CacheRepository) GetInt(ctx context.Context, key string) (int, error) {
	return r.client.Get(ctx, key).Int()
}

// GetFloat récupère une valeur float du cache
func (r *CacheRepository) GetFloat(ctx context.Context, key string) (float64, error) {
	return r.client.Get(ctx, key).Float64()
}

// GetBool récupère une valeur bool du cache
func (r *CacheRepository) GetBool(ctx context.Context, key string) (bool, error) {
	val, err := r.client.Get(ctx, key).Result()
	if err != nil {
		return false, err
	}
	return val == "true" || val == "1", nil
}

// Delete supprime une clé du cache
func (r *CacheRepository) Delete(ctx context.Context, key string) error {
	return r.client.Del(ctx, key).Err()
}

// Exists vérifie si une clé existe
func (r *CacheRepository) Exists(ctx context.Context, key string) (bool, error) {
	count, err := r.client.Exists(ctx, key).Result()
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// DeletePattern supprime toutes les clés correspondant au pattern
func (r *CacheRepository) DeletePattern(ctx context.Context, pattern string) error {
	keys, err := r.client.Keys(ctx, pattern).Result()
	if err != nil {
		return err
	}
	
	if len(keys) > 0 {
		return r.client.Del(ctx, keys...).Err()
	}
	
	return nil
}

// Increment incrémente une valeur numérique
func (r *CacheRepository) Increment(ctx context.Context, key string) (int64, error) {
	return r.client.Incr(ctx, key).Result()
}

// IncrementBy incrémente une valeur numérique par un montant
func (r *CacheRepository) IncrementBy(ctx context.Context, key string, value int64) (int64, error) {
	return r.client.IncrBy(ctx, key, value).Result()
}

// Decrement décrémente une valeur numérique
func (r *CacheRepository) Decrement(ctx context.Context, key string) (int64, error) {
	return r.client.Decr(ctx, key).Result()
}

// SetExpiration définit une expiration sur une clé existante
func (r *CacheRepository) SetExpiration(ctx context.Context, key string, expiration time.Duration) error {
	return r.client.Expire(ctx, key, expiration).Err()
}

// GetTTL retourne le temps de vie restant d'une clé
func (r *CacheRepository) GetTTL(ctx context.Context, key string) (time.Duration, error) {
	return r.client.TTL(ctx, key).Result()
}

// GetKeys retourne toutes les clés correspondant au pattern
func (r *CacheRepository) GetKeys(ctx context.Context, pattern string) ([]string, error) {
	return r.client.Keys(ctx, pattern).Result()
}

// FlushAll vide tout le cache
func (r *CacheRepository) FlushAll(ctx context.Context) error {
	return r.client.FlushAll(ctx).Err()
}

// GetInfo retourne les informations du cache
func (r *CacheRepository) GetInfo(ctx context.Context) (map[string]string, error) {
info, err := r.client.Info(ctx).Result()
   if err != nil {
   	return nil, err
   }
   
   // Parser les informations Redis
   infoMap := make(map[string]string)
   lines := strings.Split(info, "\r\n")
   for _, line := range lines {
   	if strings.Contains(line, ":") {
   		parts := strings.Split(line, ":")
   		if len(parts) == 2 {
   			infoMap[parts[0]] = parts[1]
   		}
   	}
   }
   
   return infoMap, nil
}

// Ping teste la connexion au cache
func (r *CacheRepository) Ping(ctx context.Context) error {
   return r.client.Ping(ctx).Err()
}

// SetJSON stocke un objet JSON dans le cache
func (r *CacheRepository) SetJSON(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
   jsonData, err := json.Marshal(value)
   if err != nil {
   	return err
   }
   return r.client.Set(ctx, key, jsonData, expiration).Err()
}

// GetJSON récupère un objet JSON du cache
func (r *CacheRepository) GetJSON(ctx context.Context, key string, dest interface{}) error {
   val, err := r.client.Get(ctx, key).Result()
   if err != nil {
   	if err == redis.Nil {
   		return fmt.Errorf("key not found")
   	}
   	return err
   }
   
   return json.Unmarshal([]byte(val), dest)
}

// SetHash stocke un hash dans le cache
func (r *CacheRepository) SetHash(ctx context.Context, key string, field string, value interface{}) error {
   return r.client.HSet(ctx, key, field, value).Err()
}

// GetHash récupère une valeur de hash
func (r *CacheRepository) GetHash(ctx context.Context, key string, field string) (string, error) {
   return r.client.HGet(ctx, key, field).Result()
}

// GetAllHash récupère tout un hash
func (r *CacheRepository) GetAllHash(ctx context.Context, key string) (map[string]string, error) {
   return r.client.HGetAll(ctx, key).Result()
}

// DeleteHash supprime un champ de hash
func (r *CacheRepository) DeleteHash(ctx context.Context, key string, field string) error {
   return r.client.HDel(ctx, key, field).Err()
}

// AddToList ajoute un élément à une liste
func (r *CacheRepository) AddToList(ctx context.Context, key string, value interface{}) error {
   return r.client.LPush(ctx, key, value).Err()
}

// GetList récupère une liste
func (r *CacheRepository) GetList(ctx context.Context, key string, start, stop int64) ([]string, error) {
   return r.client.LRange(ctx, key, start, stop).Result()
}

// GetListLength retourne la taille d'une liste
func (r *CacheRepository) GetListLength(ctx context.Context, key string) (int64, error) {
   return r.client.LLen(ctx, key).Result()
}

// RemoveFromList supprime un élément d'une liste
func (r *CacheRepository) RemoveFromList(ctx context.Context, key string, count int64, value interface{}) (int64, error) {
   return r.client.LRem(ctx, key, count, value).Result()
}
