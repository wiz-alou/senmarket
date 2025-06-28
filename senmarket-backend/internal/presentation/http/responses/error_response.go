// internal/presentation/http/responses/error_response.go
package responses

import (
	"net/http"
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

// SendDomainError envoie une erreur métier spécifique
func SendDomainError(c *gin.Context, err error) {
	// TODO: Mapper les erreurs domain vers les codes HTTP appropriés
	switch err.Error() {
	case "utilisateur non trouvé":
		SendNotFound(c, err.Error())
	case "annonce non trouvée":
		SendNotFound(c, err.Error())
	case "quota dépassé":
		SendBadRequest(c, err.Error(), nil)
	case "fonds insuffisants":
		SendBadRequest(c, err.Error(), nil)
	default:
		SendInternalError(c, "Une erreur est survenue", err.Error())
	}
}

// SendValidationErrors envoie des erreurs de validation multiples
func SendValidationErrors(c *gin.Context, errors []validators.ValidationError) {
	SendValidationError(c, "Validation failed", errors)
}
