// internal/domain/entities/errors.go
package entities

// DomainError représente une erreur métier
type DomainError struct {
	Message string
	Code    string
}

func (e *DomainError) Error() string {
	return e.Message
}

// NewDomainError crée une nouvelle erreur métier
func NewDomainError(message string) *DomainError {
	return &DomainError{
		Message: message,
		Code:    "DOMAIN_ERROR",
	}
}

// NewDomainErrorWithCode crée une nouvelle erreur métier avec code
func NewDomainErrorWithCode(message, code string) *DomainError {
	return &DomainError{
		Message: message,
		Code:    code,
	}
}

// Validation errors
var (
	ErrInvalidUserID     = NewDomainErrorWithCode("ID utilisateur invalide", "INVALID_USER_ID")
	ErrInvalidListingID  = NewDomainErrorWithCode("ID annonce invalide", "INVALID_LISTING_ID")
	ErrInvalidCategoryID = NewDomainErrorWithCode("ID catégorie invalide", "INVALID_CATEGORY_ID")
	ErrInvalidPaymentID  = NewDomainErrorWithCode("ID paiement invalide", "INVALID_PAYMENT_ID")
	
	ErrUserNotFound     = NewDomainErrorWithCode("Utilisateur non trouvé", "USER_NOT_FOUND")
	ErrListingNotFound  = NewDomainErrorWithCode("Annonce non trouvée", "LISTING_NOT_FOUND")
	ErrCategoryNotFound = NewDomainErrorWithCode("Catégorie non trouvée", "CATEGORY_NOT_FOUND")
	ErrPaymentNotFound  = NewDomainErrorWithCode("Paiement non trouvé", "PAYMENT_NOT_FOUND")
	
	ErrUserAlreadyExists    = NewDomainErrorWithCode("Utilisateur déjà existant", "USER_ALREADY_EXISTS")
	ErrListingAlreadyExists = NewDomainErrorWithCode("Annonce déjà existante", "LISTING_ALREADY_EXISTS")
	
	ErrInsufficientFunds = NewDomainErrorWithCode("Fonds insuffisants", "INSUFFICIENT_FUNDS")
	ErrQuotaExceeded     = NewDomainErrorWithCode("Quota dépassé", "QUOTA_EXCEEDED")
	ErrUnauthorized      = NewDomainErrorWithCode("Non autorisé", "UNAUTHORIZED")
	ErrForbidden         = NewDomainErrorWithCode("Interdit", "FORBIDDEN")
)
