// internal/presentation/http/responses/error_response.go
package responses

import (
	"net/http"
	"strings"
	"github.com/gin-gonic/gin"
	"senmarket/internal/presentation/http/validators"
)

// ErrorCode codes d'erreur standardisés
type ErrorCode string

const (
	// Erreurs client (4xx)
	ErrorBadRequest       ErrorCode = "BAD_REQUEST"
	ErrorUnauthorized     ErrorCode = "UNAUTHORIZED"
	ErrorForbidden        ErrorCode = "FORBIDDEN"
	ErrorNotFound         ErrorCode = "NOT_FOUND"
	ErrorValidationFailed ErrorCode = "VALIDATION_FAILED"
	ErrorConflict         ErrorCode = "CONFLICT"
	ErrorTooManyRequests  ErrorCode = "TOO_MANY_REQUESTS"
	
	// Erreurs serveur (5xx)
	ErrorInternalServer   ErrorCode = "INTERNAL_SERVER_ERROR"
	ErrorServiceUnavailable ErrorCode = "SERVICE_UNAVAILABLE"
	ErrorGatewayTimeout   ErrorCode = "GATEWAY_TIMEOUT"
	
	// Erreurs métier
	ErrorUserNotFound     ErrorCode = "USER_NOT_FOUND"
	ErrorListingNotFound  ErrorCode = "LISTING_NOT_FOUND"
	ErrorPaymentFailed    ErrorCode = "PAYMENT_FAILED"
	ErrorQuotaExceeded    ErrorCode = "QUOTA_EXCEEDED"
	ErrorInsufficientFunds ErrorCode = "INSUFFICIENT_FUNDS"
	ErrorInvalidRegion    ErrorCode = "INVALID_REGION"
	ErrorInvalidPhone     ErrorCode = "INVALID_PHONE"
	ErrorInvalidEmail     ErrorCode = "INVALID_EMAIL"
)

// SendError envoie une réponse d'erreur
func SendError(c *gin.Context, statusCode int, code ErrorCode, message string, details interface{}) {
	response := NewAPIResponse().WithError(string(code), message, details)
	response.Send(c, statusCode)
}

// SendBadRequest envoie une erreur 400
func SendBadRequest(c *gin.Context, message string, details interface{}) {
	if message == "" {
		message = "Bad request"
	}
	SendError(c, http.StatusBadRequest, ErrorBadRequest, message, details)
}

// SendUnauthorized envoie une erreur 401
func SendUnauthorized(c *gin.Context, message string) {
	if message == "" {
		message = "Unauthorized access"
	}
	SendError(c, http.StatusUnauthorized, ErrorUnauthorized, message, nil)
}

// SendForbidden envoie une erreur 403
func SendForbidden(c *gin.Context, message string) {
	if message == "" {
		message = "Access forbidden"
	}
	SendError(c, http.StatusForbidden, ErrorForbidden, message, nil)
}

// SendNotFound envoie une erreur 404
func SendNotFound(c *gin.Context, message string) {
	if message == "" {
		message = "Resource not found"
	}
	SendError(c, http.StatusNotFound, ErrorNotFound, message, nil)
}

// SendValidationError envoie une erreur de validation
func SendValidationError(c *gin.Context, message string, details interface{}) {
	if message == "" {
		message = "Validation failed"
	}
	SendError(c, http.StatusUnprocessableEntity, ErrorValidationFailed, message, details)
}

// SendConflict envoie une erreur 409
func SendConflict(c *gin.Context, message string, details interface{}) {
	if message == "" {
		message = "Resource conflict"
	}
	SendError(c, http.StatusConflict, ErrorConflict, message, details)
}

// SendTooManyRequests envoie une erreur 429
func SendTooManyRequests(c *gin.Context, message string) {
	if message == "" {
		message = "Too many requests"
	}
	SendError(c, http.StatusTooManyRequests, ErrorTooManyRequests, message, nil)
}

// SendInternalError envoie une erreur 500
func SendInternalError(c *gin.Context, message string, details interface{}) {
	if message == "" {
		message = "Internal server error"
	}
	SendError(c, http.StatusInternalServerError, ErrorInternalServer, message, details)
}

// SendServiceUnavailable envoie une erreur 503
func SendServiceUnavailable(c *gin.Context, message string) {
	if message == "" {
		message = "Service temporarily unavailable"
	}
	SendError(c, http.StatusServiceUnavailable, ErrorServiceUnavailable, message, nil)
}

// 🔧 CORRIGÉ: Mapping amélioré des erreurs domain vers HTTP
func SendDomainError(c *gin.Context, err error) {
	errorMessage := err.Error()
	
	// 🎯 Mapping spécifique pour les erreurs de validation ValueObjects
	switch {
	case strings.Contains(errorMessage, "région"):
		SendValidationError(c, "Région invalide", map[string]string{
			"error": errorMessage,
			"suggestion": "Utilisez un code région valide (DK, TH, SL, etc.)",
		})
		return
		
	case strings.Contains(errorMessage, "téléphone"):
		SendValidationError(c, "Format de téléphone invalide", map[string]string{
			"error": errorMessage,
			"suggestion": "Utilisez le format +221XXXXXXXXX",
		})
		return
		
	case strings.Contains(errorMessage, "email"):
		SendValidationError(c, "Format d'email invalide", map[string]string{
			"error": errorMessage,
			"suggestion": "Utilisez un format email valide",
		})
		return
		
	case strings.Contains(errorMessage, "devise"):
		SendValidationError(c, "Devise non supportée", map[string]string{
			"error": errorMessage,
			"suggestion": "Utilisez XOF, EUR, ou USD",
		})
		return
	}
	
	// 🔧 Mapping classique pour les erreurs métier
	switch errorMessage {
	case "utilisateur non trouvé", "Utilisateur non trouvé":
		SendNotFound(c, "Utilisateur non trouvé")
		
	case "annonce non trouvée", "Annonce non trouvée":
		SendNotFound(c, "Annonce non trouvée")
		
	case "catégorie non trouvée", "Catégorie non trouvée":
		SendNotFound(c, "Catégorie non trouvée")
		
	case "paiement non trouvé", "Paiement non trouvé":
		SendNotFound(c, "Paiement non trouvé")
		
	case "quota dépassé", "Quota dépassé":
		SendBadRequest(c, "Quota dépassé", map[string]string{
			"suggestion": "Mettez à niveau votre compte ou attendez la réinitialisation",
		})
		
	case "fonds insuffisants", "Fonds insuffisants":
		SendBadRequest(c, "Fonds insuffisants", map[string]string{
			"suggestion": "Rechargez votre compte",
		})
		
	case "utilisateur déjà existant", "Utilisateur déjà existant":
		SendConflict(c, "Utilisateur déjà existant", nil)
		
	case "annonce déjà existante", "Annonce déjà existante":
		SendConflict(c, "Annonce déjà existante", nil)
		
	case "non autorisé", "Non autorisé":
		SendUnauthorized(c, "Accès non autorisé")
		
	case "interdit", "Interdit":
		SendForbidden(c, "Accès interdit")
		
	// 🔧 NOUVEAU: Gestion des erreurs de validation génériques
	default:
		// Si l'erreur contient "invalide", "vide", "requis" -> Validation Error
		if strings.Contains(strings.ToLower(errorMessage), "invalide") ||
		   strings.Contains(strings.ToLower(errorMessage), "vide") ||
		   strings.Contains(strings.ToLower(errorMessage), "requis") {
			SendValidationError(c, "Validation échouée", errorMessage)
		} else {
			// Vraies erreurs internes
			SendInternalError(c, "Une erreur est survenue", errorMessage)
		}
	}
}

// SendValidationErrors envoie des erreurs de validation multiples
func SendValidationErrors(c *gin.Context, errors []validators.ValidationError) {
	SendValidationError(c, "Validation failed", errors)
}