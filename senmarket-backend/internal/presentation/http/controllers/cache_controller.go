// internal/presentation/http/controllers/cache_controller.go
package controllers

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"senmarket/internal/infrastructure/persistence/redis"
	"senmarket/internal/presentation/http/responses"
)

// CacheController contrôleur pour la gestion du cache
type CacheController struct {
	BaseController
	cacheRepo *redis.CacheRepository
}

// NewCacheController crée un nouveau contrôleur de cache
func NewCacheController(cacheRepo *redis.CacheRepository) *CacheController {
	return &CacheController{
		cacheRepo: cacheRepo,
	}
}

// CacheStats structure pour les statistiques du cache
type CacheStats struct {
	Status           string              `json:"status"`
	TotalKeys        int                 `json:"total_keys"`
	CacheKeys        int                 `json:"cache_keys"`
	RateLimitKeys    int                 `json:"rate_limit_keys"`
	KeyspaceHits     int64               `json:"keyspace_hits"`
	KeyspaceMisses   int64               `json:"keyspace_misses"`
	HitRatio         float64             `json:"hit_ratio"`
	UsedMemory       string              `json:"used_memory"`
	ConnectedClients int64               `json:"connected_clients"`
	Uptime           int64               `json:"uptime_seconds"`
	Version          string              `json:"version"`
	Categories       map[string]int      `json:"categories"`
}

type CacheKeyInfo struct {
	Key string `json:"key"`
	TTL int    `json:"ttl_seconds"`
}

// GetStats retourne les statistiques du cache Redis
func (ctrl *CacheController) GetStats(c *gin.Context) {
	ctx := c.Request.Context()
	
	// Récupérer les informations Redis
	info, err := ctrl.cacheRepo.GetInfo(ctx)
	if err != nil {
		responses.SendError(c, http.StatusInternalServerError, responses.ErrorInternalServer, "Erreur récupération stats Redis", err.Error())
		return
	}
	
	// Compter les clés par pattern
	totalKeys, _ := ctrl.cacheRepo.GetKeys(ctx, "*")
	cacheKeys, _ := ctrl.cacheRepo.GetKeys(ctx, "cache:*")
	rateLimitKeys, _ := ctrl.cacheRepo.GetKeys(ctx, "rate_limit:*")
	
	// Parser les stats importantes
	stats := CacheStats{
		Status:           "OK",
		TotalKeys:        len(totalKeys),
		CacheKeys:        len(cacheKeys),
		RateLimitKeys:    len(rateLimitKeys),
		KeyspaceHits:     parseRedisInt(info["keyspace_hits"]),
		KeyspaceMisses:   parseRedisInt(info["keyspace_misses"]),
		UsedMemory:       info["used_memory_human"],
		ConnectedClients: parseRedisInt(info["connected_clients"]),
		Uptime:           parseRedisInt(info["uptime_in_seconds"]),
		Version:          info["redis_version"],
	}
	
	// Calculer le hit ratio
	totalOperations := stats.KeyspaceHits + stats.KeyspaceMisses
	if totalOperations > 0 {
		stats.HitRatio = float64(stats.KeyspaceHits) / float64(totalOperations) * 100
	}
	
	// Ajouter les détails par catégorie
	stats.Categories = ctrl.getCacheCategories(ctx)
	
	responses.SendSuccess(c, stats, "Statistiques cache récupérées")
}

// ClearCache vide le cache
func (ctrl *CacheController) ClearCache(c *gin.Context) {
	ctx := c.Request.Context()
	
	// Pattern à supprimer (par défaut tout le cache)
	pattern := c.DefaultQuery("pattern", "cache:*")
	
	err := ctrl.cacheRepo.DelPattern(ctx, pattern)
	if err != nil {
		responses.SendError(c, http.StatusInternalServerError, responses.ErrorInternalServer, "Erreur suppression cache", err.Error())
		return
	}
	
	data := gin.H{
		"pattern": pattern,
		"cleared_at": time.Now(),
	}
	responses.SendSuccess(c, data, "Cache vidé avec succès")
}

// InvalidateKey invalide une clé spécifique
func (ctrl *CacheController) InvalidateKey(c *gin.Context) {
	ctx := c.Request.Context()
	key := c.Param("key")
	
	if key == "" {
		responses.SendBadRequest(c, "Clé requise", nil)
		return
	}
	
	err := ctrl.cacheRepo.Delete(ctx, key)
	if err != nil {
		responses.SendError(c, http.StatusInternalServerError, responses.ErrorInternalServer, "Erreur invalidation clé", err.Error())
		return
	}
	
	data := gin.H{
		"key": key,
		"invalidated_at": time.Now(),
	}
	responses.SendSuccess(c, data, "Clé invalidée")
}

// GetKeys retourne les clés de cache avec pagination
func (ctrl *CacheController) GetKeys(c *gin.Context) {
	ctx := c.Request.Context()
	
	pattern := c.DefaultQuery("pattern", "cache:*")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 50
	}
	
	// Récupérer toutes les clés
	allKeys, err := ctrl.cacheRepo.GetKeys(ctx, pattern)
	if err != nil {
		responses.SendError(c, http.StatusInternalServerError, responses.ErrorInternalServer, "Erreur récupération clés", err.Error())
		return
	}
	
	// Pagination
	total := len(allKeys)
	start := (page - 1) * limit
	end := start + limit
	
	if start >= total {
		allKeys = []string{}
	} else {
		if end > total {
			end = total
		}
		allKeys = allKeys[start:end]
	}
	
	// Enrichir avec TTL pour chaque clé
	keys := make([]CacheKeyInfo, len(allKeys))
	for i, key := range allKeys {
		ttl, _ := ctrl.cacheRepo.GetTTL(ctx, key)
		keys[i] = CacheKeyInfo{
			Key: key,
			TTL: int(ttl.Seconds()),
		}
	}
	
	data := gin.H{
		"keys":  keys,
		"total": total,
		"page":  page,
		"limit": limit,
		"pages": (total + limit - 1) / limit,
	}
	responses.SendSuccess(c, data, "Clés récupérées")
}

// Ping teste la connexion Redis
func (ctrl *CacheController) Ping(c *gin.Context) {
	ctx := c.Request.Context()
	
	err := ctrl.cacheRepo.Ping(ctx)
	if err != nil {
		responses.SendError(c, http.StatusInternalServerError, responses.ErrorInternalServer, "Redis non accessible", err.Error())
		return
	}
	
	data := gin.H{
		"status": "OK",
		"timestamp": time.Now(),
	}
	responses.SendSuccess(c, data, "Redis accessible")
}

// getCacheCategories analyse les clés pour les catégoriser
func (ctrl *CacheController) getCacheCategories(ctx context.Context) map[string]int {
	categories := make(map[string]int)
	
	patterns := map[string]string{
		"categories": "cache:*categories*",
		"listings":   "cache:*listings*",
		"users":      "cache:*users*",
		"search":     "cache:*search*",
		"rate_limit": "rate_limit:*",
	}
	
	for category, pattern := range patterns {
		keys, _ := ctrl.cacheRepo.GetKeys(ctx, pattern)
		categories[category] = len(keys)
	}
	
	return categories
}

// parseRedisInt convertit une string Redis en int64
func parseRedisInt(s string) int64 {
	if s == "" {
		return 0
	}
	val, _ := strconv.ParseInt(s, 10, 64)
	return val
}