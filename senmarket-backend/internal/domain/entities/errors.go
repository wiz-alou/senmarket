// internal/domain/entities/errors.go
package entities

// DomainError - Type de base pour les erreurs métier
type DomainError string

func (e DomainError) Error() string {
	return string(e)
}

// ================================
// ERREURS UTILISATEURS
// ================================
const (
	ErrQuotaExceeded           DomainError = "quota d'annonces gratuites dépassé"
	ErrInvalidPhaseTransition  DomainError = "transition de phase non autorisée"
	ErrUserNotVerified         DomainError = "utilisateur non vérifié"
	ErrUserInactive            DomainError = "utilisateur inactif"
)

// ================================
// ERREURS ANNONCES
// ================================
const (
	ErrUnauthorizedListing   DomainError = "annonce non autorisée"
	ErrListingNotDraft       DomainError = "annonce pas en brouillon"
	ErrTitleTooShort         DomainError = "titre trop court (min 10 caractères)"
	ErrTitleTooLong          DomainError = "titre trop long (max 200 caractères)"
	ErrDescriptionTooShort   DomainError = "description trop courte (min 20 caractères)"
	ErrInvalidPrice          DomainError = "prix invalide"
	ErrNoImages              DomainError = "au moins une image requise"
	ErrTooManyImages         DomainError = "maximum 8 images autorisées"
	ErrInvalidRegion         DomainError = "région invalide"
)

// ================================
// ERREURS CATÉGORIES
// ================================
const (
	ErrCategorySlugRequired DomainError = "slug de catégorie requis"
	ErrCategoryNameRequired DomainError = "nom de catégorie requis" 
	ErrCategoryIconRequired DomainError = "icône de catégorie requise"
)

// ================================
// ERREURS PAIEMENTS
// ================================
const (
	ErrUnsupportedPaymentMethod DomainError = "méthode de paiement non supportée"
	ErrPaymentNotPending        DomainError = "paiement pas en attente"
	ErrPaymentExpired           DomainError = "paiement expiré"
)