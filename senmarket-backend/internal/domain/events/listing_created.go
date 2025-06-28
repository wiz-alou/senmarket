// internal/domain/events/listing_created.go
package events

import (
	"time"
)

const ListingCreatedEventType = "listing.created"

// ListingCreatedEvent événement de création d'annonce
type ListingCreatedEvent struct {
	*BaseEvent
	ListingID   string  `json:"listing_id"`
	UserID      string  `json:"user_id"`
	CategoryID  string  `json:"category_id"`
	Title       string  `json:"title"`
	Price       float64 `json:"price"`
	Currency    string  `json:"currency"`
	Region      string  `json:"region"`
	IsPaid      bool    `json:"is_paid"`
}

// NewListingCreatedEvent crée un nouvel événement de création d'annonce
func NewListingCreatedEvent(listingID, userID, categoryID, title, region string, price float64, currency string, isPaid bool) *ListingCreatedEvent {
	data := map[string]interface{}{
		"listing_id":  listingID,
		"user_id":     userID,
		"category_id": categoryID,
		"title":       title,
		"price":       price,
		"currency":    currency,
		"region":      region,
		"is_paid":     isPaid,
		"created_at":  time.Now(),
	}

	return &ListingCreatedEvent{
		BaseEvent:   NewBaseEvent(listingID, ListingCreatedEventType, data),
		ListingID:   listingID,
		UserID:      userID,
		CategoryID:  categoryID,
		Title:       title,
		Price:       price,
		Currency:    currency,
		Region:      region,
		IsPaid:      isPaid,
	}
}
