// internal/application/handlers/create_listing_handler.go
package handlers

import (
	"context"
	"time"
	
	"senmarket/internal/application/commands"
	"senmarket/internal/application/dto"
	"senmarket/internal/application/services"
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/valueobjects"
)

// CreateListingHandler - Handler pour créer une annonce
type CreateListingHandler struct {
	services.BaseService
}

// NewCreateListingHandler - Constructeur
func NewCreateListingHandler() *CreateListingHandler {
	return &CreateListingHandler{}
}

// Handle - Traite la commande CreateListing
func (h *CreateListingHandler) Handle(ctx context.Context, cmd commands.CreateListingCommand) (*dto.ListingDTO, error) {
	// 1. Valider la commande
	if err := h.ValidateCommand(ctx, &cmd); err != nil {
		h.LogError(ctx, "CreateListing.Validate", err)
		return nil, err
	}
	
	// 2. Créer l'entité Listing
	now := time.Now()
	listing := &entities.Listing{
		ID:          entities.NewUUID(),
		UserID:      cmd.UserID,
		CategoryID:  cmd.CategoryID,
		Title:       cmd.Title,
		Description: cmd.Description,
		Price:       cmd.Price,
		Currency:    cmd.Currency,
		Region:      cmd.Region,
		Status:      string(valueobjects.ListingStatusDraft), // Draft par défaut
		ViewsCount:  0,
		IsFeatured:  false,
		Images:      cmd.Images,
		ExpiresAt:   now.Add(30 * 24 * time.Hour), // 30 jours
		CreatedAt:   now,
		UpdatedAt:   now,
	}
	
	// 3. Log de réussite
	h.LogInfo(ctx, "CreateListing", "Annonce créée avec succès")
	
	// 4. Convertir en DTO et retourner
	return dto.ListingDTOFromEntity(listing), nil
}
