// internal/application/dto/listing_dto.go
package dto

import (
	"senmarket/internal/domain/entities"
	"time"
)

// ListingDTO DTO pour les annonces
type ListingDTO struct {
	ID            string    `json:"id"`
	UserID        string    `json:"user_id"`
	CategoryID    string    `json:"category_id"`
	Title         string    `json:"title"`
	Description   string    `json:"description"`
	Price         string    `json:"price"`
	Images        []string  `json:"images"`
	Region        string    `json:"region"`
	Location      string    `json:"location"`
	Status        string    `json:"status"`
	IsPromoted    bool      `json:"is_promoted"`
	IsPaid        bool      `json:"is_paid"`
	ViewsCount    int64     `json:"views_count"`
	ContactsCount int64     `json:"contacts_count"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	ExpiresAt     time.Time `json:"expires_at"`
	PromotedAt    *time.Time `json:"promoted_at,omitempty"`
	SoldAt        *time.Time `json:"sold_at,omitempty"`
}

// NewListingDTO crée un nouveau ListingDTO depuis une entité Listing
func NewListingDTO(listing *entities.Listing) *ListingDTO {
	return &ListingDTO{
		ID:            listing.ID,
		UserID:        listing.UserID,
		CategoryID:    listing.CategoryID,
		Title:         listing.Title,
		Description:   listing.Description,
		Price:         listing.GetPriceFormatted(),
		Images:        listing.Images,
		Region:        listing.GetRegionName(),
		Location:      listing.Location,
		Status:        string(listing.Status),
		IsPromoted:    listing.IsPromoted,
		IsPaid:        listing.IsPaid,
		ViewsCount:    listing.ViewsCount,
		ContactsCount: listing.ContactsCount,
		CreatedAt:     listing.CreatedAt,
		UpdatedAt:     listing.UpdatedAt,
		ExpiresAt:     listing.ExpiresAt,
		PromotedAt:    listing.PromotedAt,
		SoldAt:        listing.SoldAt,
	}
}

// ListingListDTO DTO pour une liste d'annonces avec pagination
type ListingListDTO struct {
	Listings []*ListingDTO `json:"listings"`
	Total    int64         `json:"total"`
	Offset   int           `json:"offset"`
	Limit    int           `json:"limit"`
	HasMore  bool          `json:"has_more"`
}

// NewListingListDTO crée un nouveau ListingListDTO
func NewListingListDTO(listings []*entities.Listing, total int64, offset, limit int) *ListingListDTO {
	dtos := make([]*ListingDTO, len(listings))
	for i, listing := range listings {
		dtos[i] = NewListingDTO(listing)
	}
	
	hasMore := int64(offset+limit) < total
	
	return &ListingListDTO{
		Listings: dtos,
		Total:    total,
		Offset:   offset,
		Limit:    limit,
		HasMore:  hasMore,
	}
}

// ListingSummaryDTO DTO pour un résumé d'annonce
type ListingSummaryDTO struct {
	ID         string `json:"id"`
	Title      string `json:"title"`
	Price      string `json:"price"`
	Region     string `json:"region"`
	Status     string `json:"status"`
	IsPromoted bool   `json:"is_promoted"`
	CreatedAt  time.Time `json:"created_at"`
}

// NewListingSummaryDTO crée un nouveau ListingSummaryDTO
func NewListingSummaryDTO(listing *entities.Listing) *ListingSummaryDTO {
	return &ListingSummaryDTO{
		ID:         listing.ID,
		Title:      listing.Title,
		Price:      listing.GetPriceFormatted(),
		Region:     listing.GetRegionName(),
		Status:     string(listing.Status),
		IsPromoted: listing.IsPromoted,
		CreatedAt:  listing.CreatedAt,
	}
}

