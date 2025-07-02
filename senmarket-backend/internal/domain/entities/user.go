// internal/domain/entities/user.go
package entities

import (
	"time"
	"github.com/google/uuid"
	"senmarket/internal/domain/valueobjects"
)

// User représente un utilisateur de la plateforme SenMarket
type User struct {
	ID       uuid.UUID `json:"id"`
	Phone    string    `json:"phone"`    // Numéro de téléphone unique
	Email    *string   `json:"email"`    // Email optionnel
	
	// Authentification
	PasswordHash string `json:"-"` // Jamais exposé en JSON
	
	// Informations personnelles
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	AvatarURL *string `json:"avatar_url"`
	Region    string `json:"region"` // Région du Sénégal
	
	// Statuts
	IsVerified bool `json:"is_verified"`
	IsActive   bool `json:"is_active"`
	IsPremium  bool `json:"is_premium"`
	
	// Quotas et limites (logique métier)
	FreeListingsUsed  int `json:"free_listings_used"`
	FreeListingsLimit int `json:"free_listings_limit"`
	TotalListingsCount int `json:"total_listings_count"`
	
	// Phases de monétisation
	OnboardingPhase    valueobjects.OnboardingPhase    `json:"onboarding_phase"`
	RegistrationPhase  valueobjects.RegistrationPhase  `json:"registration_phase"`
	
	// Métadonnées temporelles
	LastFreeReset    time.Time  `json:"last_free_reset"`
	LastLoginAt      *time.Time `json:"last_login_at"`
	VerifiedAt       *time.Time `json:"verified_at"`
	PremiumExpiresAt *time.Time `json:"premium_expires_at"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
	DeletedAt        *time.Time `json:"deleted_at"`
}

