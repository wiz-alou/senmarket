// internal/presentation/http/middleware/cache_middleware.go
package middleware

import (
	"bytes"
	"crypto/md5"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"senmarket/internal/infrastructure/persistence/redis"
)

// CacheMiddleware middleware pour le cache Redis
type CacheMiddleware struct {
	cacheRepo *redis.CacheRepository
}

// NewCacheMiddleware crée un nouveau middleware de cache
func NewCacheMiddleware(cacheRepo *redis.CacheRepository) *CacheMiddleware {
	return &CacheMiddleware{
		cacheRepo: cacheRepo,
	}
}

// responseWriter wrapper pour capturer la réponse
type responseWriter struct {
	gin.ResponseWriter
	body   *bytes.Buffer
	status int
}

func (w *responseWriter) Write(data []byte) (int, error) {
	w.body.Write(data)
	return w.ResponseWriter.Write(data)
}

func (w *responseWriter) WriteHeader(status int) {
	w.status = status
	w.ResponseWriter.WriteHeader(status)
}

// CachedResponse structure pour stocker les réponses en cache
type CachedResponse struct {
	Status      int                 `json:"status"`
	Body        []byte              `json:"body"`
	ContentType string              `json:"content_type"`
	Headers     map[string][]string `json:"headers"`
}

// CacheResponse middleware pour mettre en cache les réponses
func (m *CacheMiddleware) CacheResponse(ttl time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		// ⭐ NOUVEAU : Vérification nil pointer
		if m.cacheRepo == nil {
			// Si Redis n'est pas disponible, pas de cache mais on continue
			c.Header("X-Cache", "BYPASS")
			c.Next()
			return
		}

		// Ignorer les méthodes non-GET
		if c.Request.Method != http.MethodGet {
			c.Next()
			return
		}

		// Générer la clé de cache
		cacheKey := m.generateCacheKey(c)

		// Essayer de récupérer depuis le cache
		var cachedResponse CachedResponse
		err := m.cacheRepo.GetJSON(c, cacheKey, &cachedResponse)
		if err == nil {
			// Cache HIT - Retourner la réponse cachée
			c.Header("X-Cache", "HIT")
			c.Header("X-Cache-Key", cacheKey)
			c.Header("Content-Type", cachedResponse.ContentType)
			
			// Copier les headers
			for key, values := range cachedResponse.Headers {
				for _, value := range values {
					c.Header(key, value)
				}
			}
			
			c.Data(cachedResponse.Status, cachedResponse.ContentType, cachedResponse.Body)
			c.Abort()
			return
		}

		// Cache MISS - Traiter la requête et mettre en cache
		writer := &responseWriter{
			ResponseWriter: c.Writer,
			body:          bytes.NewBuffer(nil),
			status:        http.StatusOK,
		}
		c.Writer = writer

		c.Header("X-Cache", "MISS")
		c.Header("X-Cache-Key", cacheKey)
		
		c.Next()

		// Mettre en cache la réponse si elle est valide
		if writer.status >= 200 && writer.status < 300 {
			cachedResponse := CachedResponse{
				Status:      writer.status,
				Body:        writer.body.Bytes(),
				ContentType: c.GetHeader("Content-Type"),
				Headers:     make(map[string][]string),
			}

			// Copier les headers importants
			for _, header := range []string{"Content-Type", "Cache-Control", "ETag"} {
				if values := c.Writer.Header()[header]; len(values) > 0 {
					cachedResponse.Headers[header] = values
				}
			}

			// Stocker en cache de manière asynchrone
			go func() {
				m.cacheRepo.SetJSON(c, cacheKey, cachedResponse, ttl)
			}()
		}
	}
}

// generateCacheKey génère une clé unique pour la requête
func (m *CacheMiddleware) generateCacheKey(c *gin.Context) string {
	// Construire la clé avec URL + query params + user context
	var keyParts []string
	
	// Path de base
	keyParts = append(keyParts, c.Request.URL.Path)
	
	// Query parameters (triés pour consistance)
	if c.Request.URL.RawQuery != "" {
		keyParts = append(keyParts, c.Request.URL.RawQuery)
	}
	
	// User ID si authentifié (pour cache par utilisateur)
	if userID := c.GetString("user_id"); userID != "" {
		keyParts = append(keyParts, "user:"+userID)
	}
	
	// Region du client
	if region := c.GetHeader("X-Region"); region != "" {
		keyParts = append(keyParts, "region:"+region)
	}
	
	// Créer un hash MD5 pour la clé
	key := strings.Join(keyParts, "|")
	hash := md5.Sum([]byte(key))
	
	return fmt.Sprintf("cache:%x", hash)
}

// InvalidatePattern invalide toutes les clés matchant un pattern
func (m *CacheMiddleware) InvalidatePattern(pattern string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// ⭐ NOUVEAU : Vérification nil pointer
		if m.cacheRepo != nil {
			go func() {
				m.cacheRepo.DelPattern(c, pattern)
			}()
		}
		c.Next()
	}
}

// RateLimit middleware de limitation de débit
func (m *CacheMiddleware) RateLimit(maxRequests int64, window time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		// ⭐ NOUVEAU : Vérification nil pointer
		if m.cacheRepo == nil {
			// Si Redis n'est pas disponible, on laisse passer sans rate limiting
			c.Next()
			return
		}

		// Identifier le client (IP + User-Agent)
		clientID := m.getClientID(c)
		
		// Clé de rate limiting
		key := fmt.Sprintf("rate_limit:%s", clientID)
		
		// Incrémenter le compteur avec TTL
		count, err := m.cacheRepo.IncrEx(c, key, window)
		if err != nil {
			// En cas d'erreur Redis, on laisse passer
			c.Next()
			return
		}
		
		// Ajouter les headers de rate limiting
		c.Header("X-RateLimit-Limit", strconv.FormatInt(maxRequests, 10))
		
		// Calcul sécurisé du remaining
		remaining := maxRequests - count
		if remaining < 0 {
			remaining = 0
		}
		c.Header("X-RateLimit-Remaining", strconv.FormatInt(remaining, 10))
		c.Header("X-RateLimit-Reset", strconv.FormatInt(time.Now().Add(window).Unix(), 10))
		
		// Vérifier la limite
		if count > maxRequests {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"success": false,
				"message": "Trop de requêtes, veuillez ralentir",
				"retry_after": int(window.Seconds()),
			})
			c.Abort()
			return
		}
		
		c.Next()
	}
}

// getClientID identifie le client de manière unique
func (m *CacheMiddleware) getClientID(c *gin.Context) string {
	// Priorité : User ID > IP + User-Agent
	if userID := c.GetString("user_id"); userID != "" {
		return "user:" + userID
	}
	
	// Sinon IP + hash du User-Agent
	ip := c.ClientIP()
	userAgent := c.GetHeader("User-Agent")
	hash := md5.Sum([]byte(userAgent))
	
	return fmt.Sprintf("ip:%s:%x", ip, hash[:8])
}