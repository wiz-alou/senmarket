// internal/application/commands/publish_listing.go
package commands

import "github.com/google/uuid"

// PublishListingCommand - Command pour publier une annonce
type PublishListingCommand struct {
	ListingID uuid.UUID `json:"listing_id" validate:"required"`
	UserID    uuid.UUID `json:"user_id" validate:"required"`
	IsPaid    bool      `json:"is_paid"`
}
	