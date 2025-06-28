// internal/presentation/http/middleware/rate_limit_middleware.go
package middleware

import (
	"fmt"
	"strconv"
	"time"
	"github.com/gin-gonic/gin"
	"senmarket/internal/presentation/http/responses"
)

// RateLimitConfig configuration de limitation de débit
type RateLimitConfig struct {
	Requests    int           // Nombre de requêtes autorisées
	Window      time.Duration // Fenêtre de temps
	KeyFunc     func(*gin.Context) string // Fonction pour générer la clé
	SkipFunc    func(*gin.Context) bool   // Fonction pour ignorer certaines requêtes
	OnLimitFunc func(*gin.Context)        // Fonction appelée quand limite atteinte
}

// store simple en mémoire pour le rate limiting
type memoryStore struct {
	data map[string]*rateLimitEntry
}

type rateLimitEntry struct {
	count     int
	expiresAt time.Time
}

var store = &memoryStore{
	data: make(map[string]*rateLimitEntry),
}

// DefaultRateLimitConfig configuration par défaut
func DefaultRateLimitConfig() RateLimitConfig {
	return RateLimitConfig{
		Requests: 100,
		Window:   time.Minute,
		KeyFunc: func(c *gin.Context) string {
			// Utiliser l'IP client par défaut
			return c.ClientIP()
		},
		SkipFunc: nil,
		OnLimitFunc: func(c *gin.Context) {
			responses.SendTooManyRequests(c, "Trop de requêtes, veuillez réessayer plus tard")
		},
	}
}

// RateLimit retourne un middleware de limitation de débit
func RateLimit(config ...RateLimitConfig) gin.HandlerFunc {
	var cfg RateLimitConfig
	if len(config) > 0 {
		cfg = config[0]
	} else {
		cfg = DefaultRateLimitConfig()
	}
	
	return func(c *gin.Context) {
		// Vérifier si on doit ignorer cette requête
		if cfg.SkipFunc != nil && cfg.SkipFunc(c) {
			c.Next()
			return
		}
		
		key := cfg.KeyFunc(c)
		now := time.Now()
		
		// Nettoyer les entrées expirées
		store.cleanup(now)
		
		// Récupérer ou créer l'entrée
		entry, exists := store.data[key]
		if !exists || entry.expiresAt.Before(now) {
			entry = &rateLimitEntry{
				count:     1,
				expiresAt: now.Add(cfg.Window),
			}
			store.data[key] = entry
		} else {
			entry.count++
		}
		
		// Ajouter les headers de rate limiting
		c.Header("X-RateLimit-Limit", strconv.Itoa(cfg.Requests))
		c.Header("X-RateLimit-Remaining", strconv.Itoa(max(0, cfg.Requests-entry.count)))
		c.Header("X-RateLimit-Reset", strconv.FormatInt(entry.expiresAt.Unix(), 10))
		
		// Vérifier si la limite est atteinte
		if entry.count > cfg.Requests {
			cfg.OnLimitFunc(c)
			c.Abort()
			return
		}
		
		c.Next()
	}
}

// RateLimitByUser limitation par utilisateur authentifié
func RateLimitByUser(requests int, window time.Duration) gin.HandlerFunc {
	config := RateLimitConfig{
		Requests: requests,
		Window:   window,
		KeyFunc: func(c *gin.Context) string {
			if userID := c.GetString("user_id"); userID != "" {
				return "user:" + userID
			}
			return "ip:" + c.ClientIP()
		},
		OnLimitFunc: func(c *gin.Context) {
			responses.SendTooManyRequests(c, "Limite de requêtes utilisateur atteinte")
		},
	}
	
	return RateLimit(config)
}

// RateLimitByEndpoint limitation par endpoint
func RateLimitByEndpoint(requests int, window time.Duration) gin.HandlerFunc {
	config := RateLimitConfig{
		Requests: requests,
		Window:   window,
		KeyFunc: func(c *gin.Context) string {
			return fmt.Sprintf("%s:%s:%s", c.ClientIP(), c.Request.Method, c.FullPath())
		},
		OnLimitFunc: func(c *gin.Context) {
			responses.SendTooManyRequests(c, "Limite de requêtes pour cet endpoint atteinte")
		},
	}
	
	return RateLimit(config)
}

// cleanup nettoie les entrées expirées
func (s *memoryStore) cleanup(now time.Time) {
	for key, entry := range s.data {
		if entry.expiresAt.Before(now) {
			delete(s.data, key)
		}
	}
}

// max retourne le maximum de deux entiers
func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
