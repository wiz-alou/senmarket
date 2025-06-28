// internal/application/commands/delete_listing.go
package commands

import (
	"context"
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/repositories"
	"time"
)

// DeleteListingCommand commande pour supprimer une annonce
type DeleteListingCommand struct {
	ListingID string `json:"listing_id" validate:"required"`
	UserID    string `json:"user_id" validate:"required"`
}

// DeleteListingHandler handler pour supprimer une annonce
type DeleteListingHandler struct {
	listingRepo repositories.ListingRepository
}

// NewDeleteListingHandler crée un nouveau handler
func NewDeleteListingHandler(listingRepo repositories.ListingRepository) *DeleteListingHandler {
	return &DeleteListingHandler{
		listingRepo: listingRepo,
	}
}

// Handle traite la commande de suppression d'annonce
func (h *DeleteListingHandler) Handle(ctx context.Context, cmd *DeleteListingCommand) (*DeleteListingResult, error) {
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
	
	// Marquer comme supprimée
	listing.Delete()
	
	// Sauvegarder
	if err := h.listingRepo.Update(ctx, listing); err != nil {
		return nil, err
	}
	
	return &DeleteListingResult{
		ListingID: listing.ID,
		DeletedAt: listing.UpdatedAt,
	}, nil
}

// DeleteListingResult résultat de suppression d'annonce
type DeleteListingResult struct {
	ListingID string    `json:"listing_id"`
	DeletedAt time.Time `json:"deleted_at"`
}
