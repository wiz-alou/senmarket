// internal/handlers/cache_handler.go
package handlers

import (
	"net/http"
	"senmarket/internal/services"
	"github.com/gin-gonic/gin"
)

type CacheHandler struct {
	cacheService *services.CacheService
}

func NewCacheHandler(cacheService *services.CacheService) *CacheHandler {
	return &CacheHandler{
		cacheService: cacheService,
	}
}

func (h *CacheHandler) GetCacheStats(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Cache stats",
		"status":  "OK",
	})
}

func (h *CacheHandler) ClearCache(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Cache cleared",
		"status":  "OK",
	})
}

func (h *CacheHandler) WarmupCache(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Cache warmup initiated",
		"status":  "OK",
	})
}