// internal/handlers/whatsapp_handler.go - VERSION CORRIGÉE
package handlers

import (
	"net/http"
	"strings"
	"time"

	"senmarket/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type WhatsAppHandler struct {
	whatsappService *services.WhatsAppService
	validator       *validator.Validate
}

type SendWhatsAppCodeRequest struct {
	Phone string `json:"phone" validate:"required,min=9"`
}

type VerifyWhatsAppCodeRequest struct {
	Phone string `json:"phone" validate:"required,min=9"`
	Code  string `json:"code" validate:"required,len=6"`
}

func NewWhatsAppHandler(whatsappService *services.WhatsAppService) *WhatsAppHandler {
	return &WhatsAppHandler{
		whatsappService: whatsappService,
		validator:       validator.New(),
	}
}

// ✅ NOUVELLE MÉTHODE : GetStatus pour le health check WhatsApp
func (h *WhatsAppHandler) GetStatus(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"service": "WhatsApp Service",
		"status":  "active",
		"provider": "twilio",
		"features": gin.H{
			"verification_codes": true,
			"welcome_messages":   true,
			"webhook_support":    true,
		},
		"timestamp": time.Now(),
	})
}

// SendVerificationCode envoie un code via WhatsApp
func (h *WhatsAppHandler) SendVerificationCode(c *gin.Context) {
	var req SendWhatsAppCodeRequest
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Format JSON invalide",
		})
		return
	}

	if err := h.validator.Struct(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Numéro de téléphone invalide",
		})
		return
	}

	// Nettoyer le numéro
	phone := h.cleanPhoneNumber(req.Phone)

	// Envoyer le code
	response, err := h.whatsappService.SendVerificationCode(phone)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if strings.Contains(err.Error(), "limite") {
			statusCode = http.StatusTooManyRequests
		}

		c.JSON(statusCode, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":      response.Success,
		"message":      response.Message,
		"reference":    response.Reference,
		"phone":        phone,
		"provider":     "whatsapp",
		"expires_in":   600,
		"instructions": "Vérifiez votre WhatsApp pour le code",
	})
}

// ResendVerificationCode renvoie un code
func (h *WhatsAppHandler) ResendVerificationCode(c *gin.Context) {
	var req SendWhatsAppCodeRequest
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Format JSON invalide",
		})
		return
	}

	if err := h.validator.Struct(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Numéro invalide",
		})
		return
	}

	phone := h.cleanPhoneNumber(req.Phone)

	response, err := h.whatsappService.ResendVerificationCode(phone)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if strings.Contains(err.Error(), "limite") {
			statusCode = http.StatusTooManyRequests
		}

		c.JSON(statusCode, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":      response.Success,
		"message":      "Nouveau code envoyé via WhatsApp",
		"reference":    response.Reference,
		"phone":        phone,
		"provider":     "whatsapp",
		"expires_in":   600,
	})
}

// VerifyCode vérifie un code WhatsApp
func (h *WhatsAppHandler) VerifyCode(c *gin.Context) {
	var req VerifyWhatsAppCodeRequest
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Format JSON invalide",
		})
		return
	}

	if err := h.validator.Struct(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Données invalides",
		})
		return
	}

	phone := h.cleanPhoneNumber(req.Phone)

	// Vérifier le code
	if err := h.whatsappService.VerifyCode(phone, req.Code); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":     true,
		"message":     "Code vérifié avec succès",
		"phone":       phone,
		"provider":    "whatsapp",
		"verified_at": time.Now(),
	})
}

// SendWelcomeMessage envoie un message de bienvenue
func (h *WhatsAppHandler) SendWelcomeMessage(c *gin.Context) {
	var req struct {
		Phone     string `json:"phone" validate:"required"`
		FirstName string `json:"first_name" validate:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Données invalides",
		})
		return
	}

	if err := h.validator.Struct(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Validation échouée",
		})
		return
	}

	phone := h.cleanPhoneNumber(req.Phone)

	if err := h.whatsappService.SendWelcomeMessage(phone, req.FirstName); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Erreur envoi message de bienvenue",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Message de bienvenue envoyé",
	})
}

// WebhookReceiver pour recevoir les callbacks WhatsApp
func (h *WhatsAppHandler) WebhookReceiver(c *gin.Context) {
	provider := c.Param("provider")
	
	// Log du webhook pour debug
	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"message":  "Webhook reçu",
		"provider": provider,
	})
}

// ===============================
// MÉTHODES UTILITAIRES
// ===============================

func (h *WhatsAppHandler) cleanPhoneNumber(phone string) string {
	// Supprimer espaces, tirets, parenthèses
	cleaned := strings.ReplaceAll(phone, " ", "")
	cleaned = strings.ReplaceAll(cleaned, "-", "")
	cleaned = strings.ReplaceAll(cleaned, "(", "")
	cleaned = strings.ReplaceAll(cleaned, ")", "")
	
	// Ajouter +221 si nécessaire pour le Sénégal
	if !strings.HasPrefix(cleaned, "+") {
		if strings.HasPrefix(cleaned, "221") {
			cleaned = "+" + cleaned
		} else if strings.HasPrefix(cleaned, "7") || strings.HasPrefix(cleaned, "3") {
			cleaned = "+221" + cleaned
		} else {
			cleaned = "+" + cleaned
		}
	}
	
	return cleaned
}