// internal/application/commands/publish_listing.go
package commands

import (
	"context"
	"time"
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/events"
	"senmarket/internal/domain/repositories"
)

// PublishListingCommand commande pour publier une annonce
type PublishListingCommand struct {
	ListingID string `json:"listing_id" validate:"required"`
	UserID    string `json:"user_id" validate:"required"`
}

// PublishListingHandler handler pour publier une annonce
type PublishListingHandler struct {
	listingRepo    repositories.ListingRepository
	userRepo       repositories.UserRepository
	eventPublisher events.EventPublisher
}

// NewPublishListingHandler crée un nouveau handler
func NewPublishListingHandler(
	listingRepo repositories.ListingRepository,
	userRepo repositories.UserRepository,
	eventPublisher events.EventPublisher,
) *PublishListingHandler {
	return &PublishListingHandler{
		listingRepo:    listingRepo,
		userRepo:       userRepo,
		eventPublisher: eventPublisher,
	}
}

// Handle traite la commande de publication d'annonce
func (h *PublishListingHandler) Handle(ctx context.Context, cmd *PublishListingCommand) (*PublishListingResult, error) {
	// Récupérer l'annonce
	listing, err := h.listingRepo.GetByID(ctx, cmd.ListingID)
	if err != nil {
		return nil, err
	}
	if listing == nil {
		return nil, entities.ErrListingNotFound
	}
	
	// Vérifier que l'utilisateur est propriétaire
	if listing.UserID != cmd.UserID {
		return nil, entities.ErrUnauthorized
	}
	
	// Publier l'annonce
	if err := listing.Publish(); err != nil {
		return nil, err
	}
	
	// Sauvegarder
	if err := h.listingRepo.Update(ctx, listing); err != nil {
		return nil, err
	}
	
	// Publier l'événement
	event := events.NewListingPublishedEvent(
		listing.ID,
		listing.UserID,
		listing.CategoryID,
		listing.Title,
		listing.ExpiresAt,
	)
	if err := h.eventPublisher.Publish(ctx, event); err != nil {
		// Log l'erreur mais ne pas faire échouer la commande
	}
	
	return &PublishListingResult{
		ListingID:   listing.ID,
		Status:      string(listing.Status),
		PublishedAt: listing.UpdatedAt,
		ExpiresAt:   listing.ExpiresAt,
	}, nil
}

// PublishListingResult résultat de publication d'annonce
type PublishListingResult struct {
	ListingID   string    `json:"listing_id"`
	Status      string    `json:"status"`
	PublishedAt time.Time `json:"published_at"`
	ExpiresAt   time.Time `json:"expires_at"`
}
