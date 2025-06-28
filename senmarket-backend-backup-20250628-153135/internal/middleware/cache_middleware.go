// internal/middleware/cache_middleware.go
package middleware

import (
	"time"
	"senmarket/internal/services"
	"github.com/gin-gonic/gin"
)

type CacheMiddleware struct {
	cacheService *services.CacheService
}

func NewCacheMiddleware(cacheService *services.CacheService) *CacheMiddleware {
	return &CacheMiddleware{
		cacheService: cacheService,
	}
}

// RateLimit middleware simple
func (m *CacheMiddleware) RateLimit(limit int64, window time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Pour l'instant, on laisse passer tout
		c.Next()
	}
}

// CacheResponse middleware simple
func (m *CacheMiddleware) CacheResponse(ttl time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Pour l'instant, on laisse passer tout
		c.Header("X-Cache", "BYPASS")
		c.Next()
	}
}