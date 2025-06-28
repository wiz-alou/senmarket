// internal/presentation/http/middleware/logging_middleware.go
package middleware

import (
	"fmt"
	"time"
	"github.com/gin-gonic/gin"
)

// LoggingConfig configuration du logging
type LoggingConfig struct {
	SkipPaths []string
	Output    gin.LoggerConfig
}

// Logger middleware de logging personnalisé
func Logger() gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		return fmt.Sprintf("[%s] %s %s %s %d %s %s %s\n",
			param.TimeStamp.Format("2006-01-02 15:04:05"),
			param.ClientIP,
			param.Method,
			param.Path,
			param.StatusCode,
			param.Latency,
			param.Request.UserAgent(),
			param.ErrorMessage,
		)
	})
}

// StructuredLogger middleware de logging structuré
func StructuredLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery
		
		// Traiter la requête
		c.Next()
		
		// Calculer la latence
		latency := time.Since(start)
		
		// Récupérer les informations de la requête
		clientIP := c.ClientIP()
		method := c.Request.Method
		statusCode := c.Writer.Status()
		bodySize := c.Writer.Size()
		
		if raw != "" {
			path = path + "?" + raw
		}
		
		// Log structuré (TODO: Utiliser un vrai logger structuré comme logrus/zap)
		logData := map[string]interface{}{
			"timestamp":   time.Now().Format(time.RFC3339),
			"client_ip":   clientIP,
			"method":      method,
			"path":        path,
			"status_code": statusCode,
			"latency":     latency.String(),
			"body_size":   bodySize,
			"user_agent":  c.Request.UserAgent(),
		}
		
		// Ajouter l'ID utilisateur s'il existe
		if userID := c.GetString("user_id"); userID != "" {
			logData["user_id"] = userID
		}
		
		// Ajouter les erreurs s'il y en a
		if len(c.Errors) > 0 {
			logData["errors"] = c.Errors.String()
		}
		
		// TODO: Envoyer vers un système de logging approprié
		fmt.Printf("REQUEST_LOG: %+v\n", logData)
	}
}

// RequestID middleware pour ajouter un ID de requête
func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = generateRequestID()
		}
		
		c.Header("X-Request-ID", requestID)
		c.Set("request_id", requestID)
		
		c.Next()
	}
}

// generateRequestID génère un ID de requête unique
func generateRequestID() string {
	// TODO: Utiliser UUID ou autre générateur d'ID unique
	return fmt.Sprintf("req_%d", time.Now().UnixNano())
}
