// internal/models/listing_quota.go
package models

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ListingQuota représente le quota d'annonces d'un utilisateur pour un mois donné
type ListingQuota struct {
	ID               uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID           uuid.UUID      `json:"user_id" gorm:"type:uuid;not null;index"`
	Month            int            `json:"month" gorm:"not null" validate:"min=1,max=12" comment:"Mois (1-12)"`
	Year             int            `json:"year" gorm:"not null" validate:"min=2025" comment:"Année (2025, 2026...)"`
	FreeListingsUsed int            `json:"free_listings_used" gorm:"default:0" comment:"Nombre d'annonces gratuites utilisées"`
	FreeListingsLimit int           `json:"free_listings_limit" gorm:"default:3" comment:"Limite d'annonces gratuites pour ce mois"`
	PaidListings     int            `json:"paid_listings" gorm:"default:0" comment:"Nombre d'annonces payées ce mois"`
	
	// Métadonnées
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	
	// Relations
	User User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// BeforeCreate hook
func (q *ListingQuota) BeforeCreate(tx *gorm.DB) error {
	if q.ID == uuid.Nil {
		q.ID = uuid.New()
	}
	
	// Validation des données
	if q.Month < 1 || q.Month > 12 {
		return fmt.Errorf("mois invalide: %d (doit être entre 1 et 12)", q.Month)
	}
	
	if q.Year < 2025 {
		return fmt.Errorf("année invalide: %d (doit être >= 2025)", q.Year)
	}
	
	// Définir la limite par défaut si non spécifiée
	if q.FreeListingsLimit == 0 {
		q.FreeListingsLimit = 3
	}
	
	return nil
}

// TableName override
func (ListingQuota) TableName() string {
	return "listing_quotas"
}

// CanCreateFreeListing vérifie si l'utilisateur peut créer une annonce gratuite
func (q *ListingQuota) CanCreateFreeListing() bool {
	return q.FreeListingsUsed < q.FreeListingsLimit
}

// RemainingFreeListings retourne le nombre d'annonces gratuites restantes
func (q *ListingQuota) RemainingFreeListings() int {
	remaining := q.FreeListingsLimit - q.FreeListingsUsed
	if remaining < 0 {
		return 0
	}
	return remaining
}

// ConsumeFreeListing consomme une annonce gratuite
func (q *ListingQuota) ConsumeFreeListing(db *gorm.DB) error {
	if !q.CanCreateFreeListing() {
		return fmt.Errorf("quota d'annonces gratuites épuisé (%d/%d)", q.FreeListingsUsed, q.FreeListingsLimit)
	}
	
	return db.Model(q).Update("free_listings_used", gorm.Expr("free_listings_used + 1")).Error
}

// AddPaidListing ajoute une annonce payée au compteur
func (q *ListingQuota) AddPaidListing(db *gorm.DB) error {
	return db.Model(q).Update("paid_listings", gorm.Expr("paid_listings + 1")).Error
}

// GetMonthName retourne le nom du mois en français
func (q *ListingQuota) GetMonthName() string {
	months := []string{
		"", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
		"Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
	}
	
	if q.Month >= 1 && q.Month <= 12 {
		return months[q.Month]
	}
	
	return fmt.Sprintf("Mois %d", q.Month)
}

// GetPeriodString retourne une représentation textuelle de la période
func (q *ListingQuota) GetPeriodString() string {
	return fmt.Sprintf("%s %d", q.GetMonthName(), q.Year)
}

// IsCurrentMonth vérifie si ce quota correspond au mois actuel
func (q *ListingQuota) IsCurrentMonth() bool {
	now := time.Now()
	return q.Year == now.Year() && q.Month == int(now.Month())
}

// GetProgress retourne le pourcentage d'utilisation du quota gratuit
func (q *ListingQuota) GetProgress() float64 {
	if q.FreeListingsLimit == 0 {
		return 0
	}
	
	progress := float64(q.FreeListingsUsed) / float64(q.FreeListingsLimit) * 100
	if progress > 100 {
		return 100
	}
	
	return progress
}

// GetSummary retourne un résumé du quota
func (q *ListingQuota) GetSummary() map[string]interface{} {
	return map[string]interface{}{
		"period":              q.GetPeriodString(),
		"month":               q.Month,
		"year":                q.Year,
		"free_used":           q.FreeListingsUsed,
		"free_limit":          q.FreeListingsLimit,
		"free_remaining":      q.RemainingFreeListings(),
		"paid_listings":       q.PaidListings,
		"total_listings":      q.FreeListingsUsed + q.PaidListings,
		"can_create_free":     q.CanCreateFreeListing(),
		"progress_percent":    q.GetProgress(),
		"is_current_month":    q.IsCurrentMonth(),
	}
}

// NextResetDate retourne la date de remise à zéro du quota (1er du mois suivant)
func (q *ListingQuota) NextResetDate() time.Time {
	nextMonth := time.Month(q.Month + 1)
	nextYear := q.Year
	
	// Gérer le passage à l'année suivante
	if nextMonth > 12 {
		nextMonth = 1
		nextYear++
	}
	
	return time.Date(nextYear, nextMonth, 1, 0, 0, 0, 0, time.UTC)
}

// DaysUntilReset retourne le nombre de jours avant la remise à zéro
func (q *ListingQuota) DaysUntilReset() int {
	resetDate := q.NextResetDate()
	now := time.Now()
	
	if now.After(resetDate) {
		return 0
	}
	
	duration := resetDate.Sub(now)
	return int(duration.Hours() / 24)
}

// CreateForCurrentMonth crée un quota pour le mois actuel d'un utilisateur
func CreateQuotaForCurrentMonth(db *gorm.DB, userID uuid.UUID) (*ListingQuota, error) {
	now := time.Now()
	
	quota := &ListingQuota{
		UserID:            userID,
		Month:             int(now.Month()),
		Year:              now.Year(),
		FreeListingsUsed:  0,
		FreeListingsLimit: 3, // Valeur par défaut
		PaidListings:      0,
	}
	
	if err := db.Create(quota).Error; err != nil {
		return nil, fmt.Errorf("erreur création quota: %w", err)
	}
	
	return quota, nil
}

// GetOrCreateQuotaForPeriod récupère ou crée un quota pour une période donnée
func GetOrCreateQuotaForPeriod(db *gorm.DB, userID uuid.UUID, month, year int) (*ListingQuota, error) {
	var quota ListingQuota
	
	err := db.Where("user_id = ? AND month = ? AND year = ?", userID, month, year).
		First(&quota).Error
	
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Créer un nouveau quota
			quota = ListingQuota{
				UserID:            userID,
				Month:             month,
				Year:              year,
				FreeListingsUsed:  0,
				FreeListingsLimit: 3,
				PaidListings:      0,
			}
			
			if err := db.Create(&quota).Error; err != nil {
				return nil, fmt.Errorf("erreur création quota: %w", err)
			}
		} else {
			return nil, fmt.Errorf("erreur récupération quota: %w", err)
		}
	}
	
	return &quota, nil
}

// GetUserQuotaHistory récupère l'historique des quotas d'un utilisateur
func GetUserQuotaHistory(db *gorm.DB, userID uuid.UUID, limit int) ([]ListingQuota, error) {
	var quotas []ListingQuota
	
	if limit <= 0 {
		limit = 12 // Par défaut, les 12 derniers mois
	}
	
	err := db.Where("user_id = ?", userID).
		Order("year DESC, month DESC").
		Limit(limit).
		Find(&quotas).Error
	
	if err != nil {
		return nil, fmt.Errorf("erreur récupération historique quotas: %w", err)
	}
	
	return quotas, nil
}

// CleanupOldQuotas supprime les quotas anciens (plus de 12 mois)
func CleanupOldQuotas(db *gorm.DB) error {
	now := time.Now()
	cutoffDate := now.AddDate(-1, 0, 0) // Il y a 12 mois
	
	result := db.Where("year < ? OR (year = ? AND month < ?)", 
		cutoffDate.Year(), 
		cutoffDate.Year(), 
		int(cutoffDate.Month())).
		Delete(&ListingQuota{})
	
	if result.Error != nil {
		return fmt.Errorf("erreur nettoyage quotas anciens: %w", result.Error)
	}
	
	return nil
}