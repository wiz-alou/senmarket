// internal/domain/events/listing_published.go
package events

import (
	"time"
)

const ListingPublishedEventType = "listing.published"

// ListingPublishedEvent événement de publication d'annonce
type ListingPublishedEvent struct {
	*BaseEvent
	ListingID    string    `json:"listing_id"`
	UserID       string    `json:"user_id"`
	CategoryID   string    `json:"category_id"`
	Title        string    `json:"title"`
	PublishedAt  time.Time `json:"published_at"`
	ExpiresAt    time.Time `json:"expires_at"`
}

// NewListingPublishedEvent crée un nouvel événement de publication
func NewListingPublishedEvent(listingID, userID, categoryID, title string, expiresAt time.Time) *ListingPublishedEvent {
	publishedAt := time.Now()
	data := map[string]interface{}{
		"listing_id":   listingID,
		"user_id":      userID,
		"category_id":  categoryID,
		"title":        title,
		"published_at": publishedAt,
		"expires_at":   expiresAt,
	}

	return &ListingPublishedEvent{
		BaseEvent:    NewBaseEvent(listingID, ListingPublishedEventType, data),
		ListingID:    listingID,
		UserID:       userID,
		CategoryID:   categoryID,
		Title:        title,
		PublishedAt:  publishedAt,
		ExpiresAt:    expiresAt,
	}
}
