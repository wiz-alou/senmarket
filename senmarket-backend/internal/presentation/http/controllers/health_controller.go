// internal/presentation/http/controllers/health_controller.go
package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"senmarket/internal/infrastructure/messaging/sms"
	"senmarket/internal/infrastructure/storage"
	"senmarket/internal/presentation/http/responses"
)

// HealthController contrôleur pour les vérifications de santé
type HealthController struct {
	BaseController
	startTime      time.Time
	twilioService  *sms.TwilioService
	storageService *storage.MinIOService // ⭐ Type spécifique, pas interface
}

// ⭐ CONSTRUCTEUR MODIFIÉ pour accepter nil
func NewHealthController(twilioService *sms.TwilioService, storageService *storage.MinIOService) *HealthController {
	return &HealthController{
		startTime:      time.Now(),
		twilioService:  twilioService,
		storageService: storageService, // ⭐ Peut être nil
	}
}

// ⭐ HealthCheck AVEC VÉRIFICATION TWILIO + MINIO
func (ctrl *HealthController) HealthCheck(c *gin.Context) {
	uptime := time.Since(ctrl.startTime)
	
	// ⭐ Vérification Twilio SMS (ne pas toucher)
	var twilioStatus map[string]interface{}
	if ctrl.twilioService != nil {
		twilioStatus = ctrl.twilioService.GetStatus()
	} else {
		twilioStatus = map[string]interface{}{
			"provider":   "twilio",
			"configured": false,
			"message":    "Service non initialisé",
		}
	}
	
	// ⭐ NOUVEAU : Vérification MinIO avec NIL check
	var storageStatus map[string]interface{}
	if ctrl.storageService != nil {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 3*time.Second)
		defer cancel()
		
		if ctrl.storageService.IsHealthy(ctx) {
			storageStatus = map[string]interface{}{
				"provider":   "minio",
				"status":     "up",
				"endpoint":   "minio:9000",
				"bucket":     "senmarket-images",
				"configured": true,
				"message":    "MinIO opérationnel",
			}
		} else {
			storageStatus = map[string]interface{}{
				"provider":   "minio",
				"status":     "down",
				"configured": true,
				"message":    "MinIO non accessible",
			}
		}
	} else {
		// Si StorageService est nil
		storageStatus = map[string]interface{}{
			"provider":   "minio",
			"status":     "not_configured",
			"configured": false,
			"message":    "Service MinIO non initialisé",
		}
	}
	
	// ⭐ Réponse avec vos données existantes + MinIO
	health := map[string]interface{}{
		"status":    "healthy",
		"timestamp": time.Now().Format(time.RFC3339),
		"uptime":    uptime.String(),
		"version":   "1.0.0",
		"service":   "senmarket-api",
		"checks": map[string]interface{}{
			"twilio_sms": twilioStatus, // ⭐ Existant
		},
		"services": map[string]interface{}{
			"storage": storageStatus, // ⭐ NOUVEAU MinIO
		},
	}
	
	responses.SendSuccess(c, health, "Service is healthy")
}

// ReadinessCheck vérifie si l'application est prête
func (ctrl *HealthController) ReadinessCheck(c *gin.Context) {
	checks := make(map[string]interface{})
	allReady := true
	
	// Vérifier MinIO
	if ctrl.storageService != nil {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 3*time.Second)
		defer cancel()
		
		if ctrl.storageService.IsHealthy(ctx) {
			checks["storage"] = map[string]interface{}{
				"status":  "ready",
				"message": "MinIO prêt",
			}
		} else {
			checks["storage"] = map[string]interface{}{
				"status":  "not_ready",
				"message": "MinIO non accessible",
			}
			allReady = false
		}
	}
	
	// Vérifier Twilio
	if ctrl.twilioService != nil && ctrl.twilioService.IsConfigured() {
		checks["sms"] = map[string]interface{}{
			"status":  "ready",
			"message": "SMS Twilio prêt",
		}
	} else {
		checks["sms"] = map[string]interface{}{
			"status":  "not_configured",
			"message": "SMS non configuré",
		}
	}
	
	status := "ready"
	if !allReady {
		status = "not_ready"
	}
	
	response := map[string]interface{}{
		"status":    status,
		"checks":    checks,
		"timestamp": time.Now().Format(time.RFC3339),
	}
	
	if allReady {
		responses.SendSuccess(c, response, "Application ready")
	} else {
		c.JSON(http.StatusServiceUnavailable, response)
	}
}

// LivenessCheck vérifie si l'application est vivante
func (ctrl *HealthController) LivenessCheck(c *gin.Context) {
	uptime := time.Since(ctrl.startTime)
	
	response := map[string]interface{}{
		"status":    "alive",
		"uptime":    uptime.String(),
		"timestamp": time.Now().Format(time.RFC3339),
	}
	
	responses.SendSuccess(c, response, "Application alive")
}

// MetricsCheck retourne des métriques de performance
func (ctrl *HealthController) MetricsCheck(c *gin.Context) {
	uptime := time.Since(ctrl.startTime)
	
	// ⭐ NOUVEAU : Métriques détaillées avec MinIO
	metrics := map[string]interface{}{
		"uptime_seconds": uptime.Seconds(),
		"uptime_human":   uptime.String(),
		"version":        "1.0.0",
		"go_version":     "1.23",
		"services": map[string]interface{}{
			"twilio_sms": map[string]interface{}{
				"configured": ctrl.twilioService != nil && ctrl.twilioService.IsConfigured(),
				"provider":   "twilio",
			},
			"storage": map[string]interface{}{
				"configured": ctrl.storageService != nil,
				"provider":   "minio",
			},
		},
		"endpoints": map[string]interface{}{
			"health":    "/health",
			"ready":     "/health/ready",
			"live":      "/health/live",
			"metrics":   "/health/metrics",
		},
	}
	
	responses.SendSuccess(c, metrics, "Application metrics")
}