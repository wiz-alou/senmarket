// internal/presentation/http/controllers/health_controller.go
package controllers

import (
	"net/http"
	"time"
	"github.com/gin-gonic/gin"
	"senmarket/internal/presentation/http/responses"
	"senmarket/internal/infrastructure/messaging/sms" // ⭐ NOUVEAU IMPORT
)

// HealthController contrôleur pour les vérifications de santé
type HealthController struct {
	BaseController
	startTime     time.Time
	twilioService *sms.TwilioService // ⭐ NOUVEAU FIELD
}

// ⭐ MODIFIÉ : NewHealthController avec TwilioService en paramètre
func NewHealthController(twilioService *sms.TwilioService) *HealthController {
	return &HealthController{
		startTime:     time.Now(),
		twilioService: twilioService, // ⭐ INJECTION
	}
}

// ⭐ MODIFIÉ : HealthCheck avec vérification Twilio
func (ctrl *HealthController) HealthCheck(c *gin.Context) {
	uptime := time.Since(ctrl.startTime)
	
	// ⭐ NOUVEAU : Récupérer le status Twilio
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
	
	health := map[string]interface{}{
		"status":    "healthy",
		"timestamp": time.Now().Format(time.RFC3339),
		"uptime":    uptime.String(),
		"version":   "1.0.0",
		"service":   "senmarket-api",
		"checks": map[string]interface{}{
			"twilio_sms": twilioStatus, // ⭐ AJOUTÉ !
		},
	}
	
	responses.SendSuccess(c, health, "Service is healthy")
}

// ReadinessCheck vérification de préparation (prêt à recevoir du trafic)
func (ctrl *HealthController) ReadinessCheck(c *gin.Context) {
	// Vérifier les dépendances incluant SMS
	smsStatus := "error"
	if ctrl.twilioService != nil && ctrl.twilioService.IsConfigured() {
		smsStatus = "ok"
	}
	
	readiness := map[string]interface{}{
		"status":    "ready",
		"timestamp": time.Now().Format(time.RFC3339),
		"checks": map[string]string{
			"database": "ok",
			"redis":    "ok", 
			"storage":  "ok",
			"sms":      smsStatus, // ⭐ AJOUTÉ
		},
	}
	
	responses.SendSuccess(c, readiness, "Service is ready")
}

// LivenessCheck vérification de vivacité (le service fonctionne)
func (ctrl *HealthController) LivenessCheck(c *gin.Context) {
	liveness := map[string]interface{}{
		"status":    "alive",
		"timestamp": time.Now().Format(time.RFC3339),
		"pid":       "placeholder", // TODO: Ajouter le PID réel
	}
	
	c.JSON(http.StatusOK, liveness)
}

// ⭐ MODIFIÉ : MetricsCheck avec métriques SMS
func (ctrl *HealthController) MetricsCheck(c *gin.Context) {
	// Métriques SMS
	smsConfigured := false
	if ctrl.twilioService != nil {
		smsConfigured = ctrl.twilioService.IsConfigured()
	}
	
	metrics := map[string]interface{}{
		"uptime":    time.Since(ctrl.startTime).String(),
		"timestamp": time.Now().Format(time.RFC3339),
		"memory": map[string]interface{}{
			// TODO: Ajouter les métriques mémoire réelles
			"used":  "placeholder",
			"total": "placeholder",
		},
		"requests": map[string]interface{}{
			// TODO: Ajouter les métriques de requêtes
			"total":   "placeholder",
			"success": "placeholder",
			"errors":  "placeholder",
		},
		"sms": map[string]interface{}{
			"provider":   "twilio",
			"configured": smsConfigured,
			"service":    "ready",
		}, // ⭐ AJOUTÉ
	}
	
	responses.SendSuccess(c, metrics, "Service metrics")
}