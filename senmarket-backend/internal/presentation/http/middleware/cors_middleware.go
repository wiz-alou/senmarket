// internal/presentation/http/middleware/cors_middleware.go
package middleware

import (
	"net/http"
	"strings"
	"github.com/gin-gonic/gin"
)

// CORSConfig configuration CORS
type CORSConfig struct {
	AllowOrigins     []string
	AllowMethods     []string
	AllowHeaders     []string
	ExposeHeaders    []string
	AllowCredentials bool
	MaxAge           int
}

// DefaultCORSConfig configuration CORS par défaut
func DefaultCORSConfig() CORSConfig {
	return CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{
			http.MethodGet,
			http.MethodPost,
			http.MethodPut,
			http.MethodPatch,
			http.MethodDelete,
			http.MethodOptions,
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Content-Length",
			"Accept-Encoding",
			"X-CSRF-Token",
			"Authorization",
			"Accept",
			"Cache-Control",
			"X-Requested-With",
		},
		ExposeHeaders: []string{
			"Content-Length",
			"Access-Control-Allow-Origin",
			"Access-Control-Allow-Headers",
			"Cache-Control",
			"Content-Language",
			"Content-Type",
		},
		AllowCredentials: true,
		MaxAge:           43200, // 12 heures
	}
}

// CORS retourne un middleware CORS
func CORS(config ...CORSConfig) gin.HandlerFunc {
	var cfg CORSConfig
	if len(config) > 0 {
		cfg = config[0]
	} else {
		cfg = DefaultCORSConfig()
	}
	
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		
		// Vérifier si l'origine est autorisée
		if len(cfg.AllowOrigins) > 0 {
			if cfg.AllowOrigins[0] == "*" {
				c.Header("Access-Control-Allow-Origin", "*")
			} else {
				for _, allowOrigin := range cfg.AllowOrigins {
					if allowOrigin == origin {
						c.Header("Access-Control-Allow-Origin", origin)
						break
					}
				}
			}
		}
		
		// Définir les autres headers CORS
		if len(cfg.AllowMethods) > 0 {
			c.Header("Access-Control-Allow-Methods", strings.Join(cfg.AllowMethods, ", "))
		}
		
		if len(cfg.AllowHeaders) > 0 {
			c.Header("Access-Control-Allow-Headers", strings.Join(cfg.AllowHeaders, ", "))
		}
		
		if len(cfg.ExposeHeaders) > 0 {
			c.Header("Access-Control-Expose-Headers", strings.Join(cfg.ExposeHeaders, ", "))
		}
		
		if cfg.AllowCredentials {
			c.Header("Access-Control-Allow-Credentials", "true")
		}
		
		if cfg.MaxAge > 0 {
			c.Header("Access-Control-Max-Age", string(rune(cfg.MaxAge)))
		}
		
		// Gérer les requêtes OPTIONS (preflight)
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		
		c.Next()
	}
}
