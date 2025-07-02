// internal/application/handlers/publish_listing_handler.go
package handlers

import (
	"context"
	"fmt"
	"time"
	
	"senmarket/internal/application/commands"
	"senmarket/internal/application/dto"
	"senmarket/internal/application/services"
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/valueobjects"
)

// PublishListingHandler - Handler pour publier une annonce
type PublishListingHandler struct {
	services.BaseService
}

// NewPublishListingHandler - Constructeur
func NewPublishListingHandler() *PublishListingHandler {
	return &PublishListingHandler{}
}

// Handle - Traite la commande PublishListing
func (h *PublishListingHandler) Handle(ctx context.Context, cmd commands.PublishListingCommand) (*dto.ListingDTO, error) {
	// 1. Créer une annonce factice pour la démonstration
	// En production, on récupérerait depuis le repository
	now := time.Now()
	listing := &entities.Listing{
		ID:          cmd.ListingID,
		UserID:      cmd.UserID,
		CategoryID:  entities.NewUUID(), // Factice
		Title:       "Annonce Test",
		Description: "Description test",
		Price:       200.0,
		Currency:    "XOF",
		Region:      "Dakar",
		Status:      string(valueobjects.ListingStatusDraft),
		ViewsCount:  0,
		IsFeatured:  false,
		Images:      []string{},
		ExpiresAt:   now.Add(30 * 24 * time.Hour),
		CreatedAt:   now,
		UpdatedAt:   now,
	}
	
	// 2. Vérifier que l'annonce peut être publiée
	if listing.Status != string(valueobjects.ListingStatusDraft) {
		return nil, fmt.Errorf("l'annonce n'est pas en mode draft")
	}
	
	// 3. Validation métier basique
	if len(listing.Title) < 10 {
		return nil, fmt.Errorf("titre trop court")
	}
	if len(listing.Description) < 20 {
		return nil, fmt.Errorf("description trop courte")
	}
	if listing.Price <= 0 {
		return nil, fmt.Errorf("prix invalide")
	}
	
	// 4. Publier l'annonce
	listing.Status = string(valueobjects.ListingStatusActive)
	listing.UpdatedAt = time.Now()
	
	// 5. Log de réussite
	h.LogInfo(ctx, "PublishListing", "Annonce publiée avec succès")
	
	// 6. Convertir en DTO et retourner
	return dto.ListingDTOFromEntity(listing), nil
}
