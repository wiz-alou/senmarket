// internal/domain/repositories/cache_repository.go
package repositories

import (
	"context"
	"time"
)

// CacheRepository - Interface pour le cache (Redis)
type CacheRepository interface {
	// Operations de base
	Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error
	Get(ctx context.Context, key string, dest interface{}) error
	Delete(ctx context.Context, key string) error
	Exists(ctx context.Context, key string) (bool, error)
	
	// Operations avancées
	SetMultiple(ctx context.Context, items map[string]interface{}, expiration time.Duration) error
	GetMultiple(ctx context.Context, keys []string) (map[string]interface{}, error)
	DeletePattern(ctx context.Context, pattern string) error
	
	// Cache avec tags
	SetWithTags(ctx context.Context, key string, value interface{}, tags []string, expiration time.Duration) error
	InvalidateByTag(ctx context.Context, tag string) error
	
	// Statistiques
	GetStats(ctx context.Context) (*CacheStats, error)
}

// CacheStats - Statistiques du cache
type CacheStats struct {
	TotalKeys   int64   `json:"total_keys"`
	HitRate     float64 `json:"hit_rate"`
	MissRate    float64 `json:"miss_rate"`
	MemoryUsage int64   `json:"memory_usage"`
}