// internal/domain/entities/quota.go
package entities

import (
	"time"
	"github.com/google/uuid"
)

// ListingQuota - Entité quota d'annonces
type ListingQuota struct {
	ID                uuid.UUID `json:"id"`
	UserID            uuid.UUID `json:"user_id"`
	Month             int       `json:"month"`
	Year              int       `json:"year"`
	FreeListingsUsed  int       `json:"free_listings_used"`
	FreeListingsLimit int       `json:"free_listings_limit"`
	PaidListings      int       `json:"paid_listings"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

// NewListingQuota crée un nouveau quota
func NewListingQuota(userID uuid.UUID, month, year int, limit int) *ListingQuota {
	now := time.Now()
	
	return &ListingQuota{
		ID:                uuid.New(),
		UserID:            userID,
		Month:             month,
		Year:              year,
		FreeListingsUsed:  0,
		FreeListingsLimit: limit,
		PaidListings:      0,
		CreatedAt:         now,
		UpdatedAt:         now,
	}
}

// ConsumeFreeListing consomme un quota gratuit
func (q *ListingQuota) ConsumeFreeListing() error {
	if q.FreeListingsUsed >= q.FreeListingsLimit {
		return ErrQuotaExceeded
	}
	
	q.FreeListingsUsed++
	q.UpdatedAt = time.Now()
	
	return nil
}

// AddPaidListing ajoute une annonce payée
func (q *ListingQuota) AddPaidListing() {
	q.PaidListings++
	q.UpdatedAt = time.Now()
}

// GetRemainingFree retourne le nombre d'annonces gratuites restantes
func (q *ListingQuota) GetRemainingFree() int {
	remaining := q.FreeListingsLimit - q.FreeListingsUsed
	if remaining < 0 {
		return 0
	}
	return remaining
}

