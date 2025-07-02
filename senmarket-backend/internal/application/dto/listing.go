// internal/application/dto/listing.go
package dto

import (
	"time"
	"github.com/google/uuid"
	"senmarket/internal/domain/entities"
)

// ListingDTO - DTO pour les réponses annonce
type ListingDTO struct {
	ID          uuid.UUID   `json:"id"`
	UserID      uuid.UUID   `json:"user_id"`
	CategoryID  uuid.UUID   `json:"category_id"`
	Title       string      `json:"title"`
	Description string      `json:"description"`
	Price       float64     `json:"price"`
	Currency    string      `json:"currency"`
	Region      string      `json:"region"`
	Status      string      `json:"status"`
	ViewsCount  int         `json:"views_count"`
	IsFeatured  bool        `json:"is_featured"`
	Images      []string    `json:"images"`
	ExpiresAt   *time.Time  `json:"expires_at"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
}

// ListingDTOFromEntity - Convertit une entité Listing en DTO
func ListingDTOFromEntity(listing *entities.Listing) *ListingDTO {
	// Gérer ExpiresAt (time.Time vers *time.Time)
	var expiresAt *time.Time
	if !listing.ExpiresAt.IsZero() {
		expiresAt = &listing.ExpiresAt
	}
	
	return &ListingDTO{
		ID:          listing.ID,
		UserID:      listing.UserID,
		CategoryID:  listing.CategoryID,
		Title:       listing.Title,
		Description: listing.Description,
		Price:       listing.Price,    // float64 direct
		Currency:    listing.Currency, // string direct
		Region:      listing.Region,   // string direct
		Status:      listing.Status,   // string direct
		ViewsCount:  listing.ViewsCount,
		IsFeatured:  listing.IsFeatured,
		Images:      listing.Images,
		ExpiresAt:   expiresAt,        // Conversion time.Time -> *time.Time
		CreatedAt:   listing.CreatedAt,
		UpdatedAt:   listing.UpdatedAt,
	}
}
