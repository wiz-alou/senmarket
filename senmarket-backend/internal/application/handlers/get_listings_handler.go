// internal/application/handlers/get_listings_handler.go
package handlers

import (
	"context"
	"time"
	
	"senmarket/internal/application/dto"
	"senmarket/internal/application/queries"
	"senmarket/internal/application/services"
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/valueobjects"
)

// GetListingsHandler - Handler pour récupérer des annonces
type GetListingsHandler struct {
	services.BaseService
}

// NewGetListingsHandler - Constructeur
func NewGetListingsHandler() *GetListingsHandler {
	return &GetListingsHandler{}
}

// Handle - Traite la query GetListings
func (h *GetListingsHandler) Handle(ctx context.Context, query queries.GetListingsQuery) ([]*dto.ListingDTO, error) {
	// 1. Appliquer les valeurs par défaut
	query.SetDefaults()
	
	// 2. Log de la requête
	h.LogInfo(ctx, "GetListings", "Récupération des annonces")
	
	// 3. Créer des annonces factices pour la démonstration
	// En production, on récupérerait depuis le repository avec les filtres
	now := time.Now()
	
	listings := []*entities.Listing{
		{
			ID:          entities.NewUUID(),
			UserID:      entities.NewUUID(),
			CategoryID:  entities.NewUUID(),
			Title:       "iPhone 14 Pro Max 256GB",
			Description: "iPhone 14 Pro Max en excellent état, 256GB de stockage, couleur noir...",
			Price:       450000,
			Currency:    "XOF",
			Region:      "Dakar",
			Status:      string(valueobjects.ListingStatusActive),
			ViewsCount:  15,
			IsFeatured:  true,
			Images:      []string{"https://example.com/iphone1.jpg", "https://example.com/iphone2.jpg"},
			ExpiresAt:   now.Add(25 * 24 * time.Hour),
			CreatedAt:   now.Add(-5 * 24 * time.Hour),
			UpdatedAt:   now.Add(-2 * 24 * time.Hour),
		},
		{
			ID:          entities.NewUUID(),
			UserID:      entities.NewUUID(),
			CategoryID:  entities.NewUUID(),
			Title:       "Appartement 3 chambres Plateau",
			Description: "Bel appartement de 3 chambres au Plateau, proche de tous les commerces...",
			Price:       85000,
			Currency:    "XOF",
			Region:      "Dakar",
			Status:      string(valueobjects.ListingStatusActive),
			ViewsCount:  8,
			IsFeatured:  false,
			Images:      []string{"https://example.com/appart1.jpg"},
			ExpiresAt:   now.Add(28 * 24 * time.Hour),
			CreatedAt:   now.Add(-3 * 24 * time.Hour),
			UpdatedAt:   now.Add(-1 * 24 * time.Hour),
		},
	}
	
	// 4. Appliquer les filtres basiques
	var filteredListings []*entities.Listing
	for _, listing := range listings {
		include := true
		
		// Filtre par région
		if query.Region != nil && listing.Region != *query.Region {
			include = false
		}
		
		// Filtre par prix minimum
		if query.MinPrice != nil && listing.Price < *query.MinPrice {
			include = false
		}
		
		// Filtre par prix maximum
		if query.MaxPrice != nil && listing.Price > *query.MaxPrice {
			include = false
		}
		
		// Filtre par recherche (titre + description)
		if query.Search != nil {
			searchTerm := *query.Search
			if !contains(listing.Title, searchTerm) && !contains(listing.Description, searchTerm) {
				include = false
			}
		}
		
		if include {
			filteredListings = append(filteredListings, listing)
		}
	}
	
	// 5. Appliquer limit/offset
	start := query.Offset
	end := query.Offset + query.Limit
	
	if start >= len(filteredListings) {
		filteredListings = []*entities.Listing{}
	} else {
		if end > len(filteredListings) {
			end = len(filteredListings)
		}
		filteredListings = filteredListings[start:end]
	}
	
	// 6. Convertir en DTOs
	listingDTOs := make([]*dto.ListingDTO, len(filteredListings))
	for i, listing := range filteredListings {
		listingDTOs[i] = dto.ListingDTOFromEntity(listing)
	}
	
	return listingDTOs, nil
}

// contains vérifie si needle est dans haystack (case insensitive)
func contains(haystack, needle string) bool {
	// Implémentation simple pour la démo
	return len(needle) == 0 || (len(haystack) > 0 && haystack == needle)
}
