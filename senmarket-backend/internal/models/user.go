// internal/models/user.go
package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Phone       string         `json:"phone" gorm:"unique;not null" validate:"required,e164"`
	Email       string         `json:"email" gorm:"unique" validate:"email"`
	PasswordHash string        `json:"-" gorm:"not null"`
	FirstName   string         `json:"first_name" gorm:"not null" validate:"required,min=2,max=50"`
	LastName    string         `json:"last_name" gorm:"not null" validate:"required,min=2,max=50"`
	AvatarURL   string         `json:"avatar_url"`
	Region      string         `json:"region" gorm:"not null" validate:"required"`
	IsVerified  bool           `json:"is_verified" gorm:"default:false"`
	IsPremium   bool           `json:"is_premium" gorm:"default:false"`
	
	// 🆕 NOUVEAUX CHAMPS POUR LA STRATÉGIE DE MONÉTISATION
	FreeListingsUsed     int        `json:"free_listings_used" gorm:"default:0" comment:"Nombre d'annonces gratuites utilisées ce mois"`
	FreeListingsLimit    int        `json:"free_listings_limit" gorm:"default:3" comment:"Limite d'annonces gratuites par mois"`
	LastFreeReset        time.Time  `json:"last_free_reset" gorm:"default:CURRENT_TIMESTAMP" comment:"Dernière réinitialisation du quota gratuit"`
	TotalListingsCount   int        `json:"total_listings_count" gorm:"default:0" comment:"Nombre total d'annonces créées"`
	PremiumExpiresAt     *time.Time `json:"premium_expires_at" comment:"Date d'expiration du premium (pour les packs futurs)"`
	
	// Métadonnées pour tracking des phases
	OnboardingPhase      string     `json:"onboarding_phase" gorm:"default:'free_launch'" comment:"Phase actuelle de l'utilisateur: free_launch, credit_system, paid"`
	RegistrationPhase    string     `json:"registration_phase" gorm:"default:'launch'" comment:"Phase lors de l'inscription: launch, transition, paid"`
	
	// Champs existants
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
	
	// Relations existantes
	Listings []Listing `json:"listings,omitempty" gorm:"foreignKey:UserID"`
	Payments []Payment `json:"payments,omitempty" gorm:"foreignKey:UserID"`
}

// BeforeCreate hook pour générer l'UUID
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	
	// Définir la phase d'inscription selon la date actuelle
	// Vous pouvez ajuster cette logique selon vos besoins
	now := time.Now()
	launchEndDate := time.Date(2025, 8, 26, 23, 59, 59, 0, time.UTC)
	
	if now.Before(launchEndDate) {
		u.RegistrationPhase = "launch"
		u.OnboardingPhase = "free_launch"
	} else {
		u.RegistrationPhase = "transition"
		u.OnboardingPhase = "credit_system"
	}
	
	return nil
}

// TableName override le nom de table
func (User) TableName() string {
	return "users"
}

// GetFullName retourne le nom complet
func (u *User) GetFullName() string {
	return u.FirstName + " " + u.LastName
}

// IsActive vérifie si l'utilisateur est actif
func (u *User) IsActive() bool {
	return u.IsVerified && u.DeletedAt.Time.IsZero()
}

// 🆕 NOUVELLES MÉTHODES POUR LA GESTION DES QUOTAS

// CanCreateFreeListing vérifie si l'utilisateur peut créer une annonce gratuite
func (u *User) CanCreateFreeListing() bool {
	// Phase de lancement gratuit = illimité
	if u.OnboardingPhase == "free_launch" {
		return true
	}
	
	// Vérifier si on doit réinitialiser le quota mensuel
	now := time.Now()
	if u.shouldResetMonthlyQuota(now) {
		return true // Sera réinitialisé lors de la prochaine création
	}
	
	// Vérifier le quota restant
	return u.FreeListingsUsed < u.FreeListingsLimit
}

// shouldResetMonthlyQuota vérifie si le quota mensuel doit être réinitialisé
func (u *User) shouldResetMonthlyQuota(now time.Time) bool {
	lastReset := u.LastFreeReset
	
	// Si c'est un nouveau mois, réinitialiser
	if now.Year() > lastReset.Year() || now.Month() > lastReset.Month() {
		return true
	}
	
	return false
}

// ResetMonthlyQuota remet à zéro le quota mensuel
func (u *User) ResetMonthlyQuota(db *gorm.DB) error {
	now := time.Now()
	
	if u.shouldResetMonthlyQuota(now) {
		updates := map[string]interface{}{
			"free_listings_used": 0,
			"last_free_reset":    now,
		}
		
		return db.Model(u).Updates(updates).Error
	}
	
	return nil
}

// ConsumeFreeListing consomme une annonce gratuite du quota
func (u *User) ConsumeFreeListing(db *gorm.DB) error {
	// Réinitialiser le quota si nécessaire
	if err := u.ResetMonthlyQuota(db); err != nil {
		return err
	}
	
	// Recharger les données après la réinitialisation potentielle
	if err := db.First(u, u.ID).Error; err != nil {
		return err
	}
	
	// Vérifier qu'on peut encore créer une annonce gratuite
	if !u.CanCreateFreeListing() {
		return ErrNoFreeListingsLeft
	}
	
	// Incrémenter le compteur
	updates := map[string]interface{}{
		"free_listings_used":    gorm.Expr("free_listings_used + 1"),
		"total_listings_count":  gorm.Expr("total_listings_count + 1"),
	}
	
	return db.Model(u).Updates(updates).Error
}

// GetRemainingFreeListings retourne le nombre d'annonces gratuites restantes
func (u *User) GetRemainingFreeListings() int {
	// Phase de lancement = illimité
	if u.OnboardingPhase == "free_launch" {
		return -1 // -1 signifie illimité
	}
	
	// Vérifier si on doit réinitialiser
	now := time.Now()
	if u.shouldResetMonthlyQuota(now) {
		return u.FreeListingsLimit // Quota complet après réinitialisation
	}
	
	remaining := u.FreeListingsLimit - u.FreeListingsUsed
	if remaining < 0 {
		return 0
	}
	
	return remaining
}

// IsInLaunchPhase vérifie si l'utilisateur est encore en phase de lancement gratuit
func (u *User) IsInLaunchPhase() bool {
	return u.OnboardingPhase == "free_launch"
}

// TransitionToNextPhase fait passer l'utilisateur à la phase suivante
func (u *User) TransitionToNextPhase(db *gorm.DB) error {
	var newPhase string
	
	switch u.OnboardingPhase {
	case "free_launch":
		newPhase = "credit_system"
	case "credit_system":
		newPhase = "paid"
	default:
		return nil // Déjà à la phase finale
	}
	
	return db.Model(u).Update("onboarding_phase", newPhase).Error
}

// GetQuotaStatus retourne un résumé du statut du quota de l'utilisateur
func (u *User) GetQuotaStatus() map[string]interface{} {
	status := map[string]interface{}{
		"phase":                u.OnboardingPhase,
		"registration_phase":   u.RegistrationPhase,
		"total_listings":       u.TotalListingsCount,
		"is_premium":          u.IsPremium,
	}
	
	if u.OnboardingPhase == "free_launch" {
		status["unlimited_free"] = true
		status["remaining_free"] = -1
		status["message"] = "Période de lancement - annonces illimitées gratuites"
	} else {
		remaining := u.GetRemainingFreeListings()
		status["unlimited_free"] = false
		status["monthly_limit"] = u.FreeListingsLimit
		status["used_this_month"] = u.FreeListingsUsed
		status["remaining_free"] = remaining
		status["last_reset"] = u.LastFreeReset
		
		if remaining > 0 {
			status["message"] = fmt.Sprintf("Il vous reste %d annonce(s) gratuite(s) ce mois", remaining)
		} else {
			status["message"] = "Quota d'annonces gratuites épuisé pour ce mois"
		}
	}
	
	return status
}

// Erreurs spécifiques
var (
	ErrNoFreeListingsLeft = errors.New("quota d'annonces gratuites épuisé pour ce mois")
	ErrInvalidPhase       = errors.New("phase utilisateur invalide")
)