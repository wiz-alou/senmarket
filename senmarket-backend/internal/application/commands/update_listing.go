// internal/application/commands/update_listing.go
package commands

import (
	"context"
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/repositories"
	"time"
)

// UpdateListingCommand commande pour mettre à jour une annonce
type UpdateListingCommand struct {
	ListingID   string   `json:"listing_id" validate:"required"`
	UserID      string   `json:"user_id" validate:"required"`
	Title       *string  `json:"title,omitempty"`
	Description *string  `json:"description,omitempty"`
	Price       *float64 `json:"price,omitempty"`
	Currency    *string  `json:"currency,omitempty"`
	Location    *string  `json:"location,omitempty"`
	Images      []string `json:"images,omitempty"`
}

// UpdateListingHandler handler pour mettre à jour une annonce
type UpdateListingHandler struct {
	listingRepo repositories.ListingRepository
}

// NewUpdateListingHandler crée un nouveau handler
func NewUpdateListingHandler(listingRepo repositories.ListingRepository) *UpdateListingHandler {
	return &UpdateListingHandler{
		listingRepo: listingRepo,
	}
}

// Handle traite la commande de mise à jour d'annonce
func (h *UpdateListingHandler) Handle(ctx context.Context, cmd *UpdateListingCommand) (*UpdateListingResult, error) {
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
	
	// Mettre à jour les champs fournis
	if cmd.Title != nil {
		listing.Title = *cmd.Title
	}
	if cmd.Description != nil {
		listing.Description = *cmd.Description
	}
	if cmd.Price != nil && cmd.Currency != nil {
		if err := listing.UpdatePrice(*cmd.Price, *cmd.Currency); err != nil {
			return nil, err
		}
	}
	if cmd.Location != nil {
		listing.Location = *cmd.Location
	}
	
	// Mettre à jour les images si fournies
	if cmd.Images != nil {
		listing.Images = cmd.Images
	}
	
	listing.UpdatedAt = time.Now()
	
	// Sauvegarder
	if err := h.listingRepo.Update(ctx, listing); err != nil {
		return nil, err
	}
	
	return &UpdateListingResult{
		ListingID: listing.ID,
		UpdatedAt: listing.UpdatedAt,
	}, nil
}

// UpdateListingResult résultat de mise à jour d'annonce
type UpdateListingResult struct {
	ListingID string    `json:"listing_id"`
	UpdatedAt time.Time `json:"updated_at"`
}
