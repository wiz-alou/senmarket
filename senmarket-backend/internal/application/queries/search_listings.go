// internal/application/queries/search_listings.go
package queries

import (
	"context"
	"senmarket/internal/application/dto"
	"senmarket/internal/domain/repositories"
)

// SearchListingsQuery requête pour rechercher des annonces
type SearchListingsQuery struct {
	Query      string   `json:"query" validate:"required,min=2"`
	CategoryID *string  `json:"category_id,omitempty"`
	Region     *string  `json:"region,omitempty"`
	PriceMin   *float64 `json:"price_min,omitempty"`
	PriceMax   *float64 `json:"price_max,omitempty"`
	Offset     int      `json:"offset" validate:"min=0"`
	Limit      int      `json:"limit" validate:"min=1,max=100"`
}

// GetPromotedListingsQuery requête pour récupérer les annonces promues
type GetPromotedListingsQuery struct {
	Limit int `json:"limit" validate:"min=1,max=20"`
}

// GetRecentListingsQuery requête pour récupérer les annonces récentes
type GetRecentListingsQuery struct {
	Limit int `json:"limit" validate:"min=1,max=20"`
}

// SearchListingsHandler handler pour la recherche d'annonces
type SearchListingsHandler struct {
	listingRepo repositories.ListingRepository
}

// NewSearchListingsHandler crée un nouveau handler
func NewSearchListingsHandler(listingRepo repositories.ListingRepository) *SearchListingsHandler {
	return &SearchListingsHandler{
		listingRepo: listingRepo,
	}
}

// HandleSearchListings traite la requête de recherche d'annonces
func (h *SearchListingsHandler) HandleSearchListings(ctx context.Context, query *SearchListingsQuery) (*dto.ListingListDTO, error) {
	filters := repositories.ListingFilters{
		CategoryID: query.CategoryID,
		Region:     query.Region,
		PriceMin:   query.PriceMin,
		PriceMax:   query.PriceMax,
	}
	
	listings, err := h.listingRepo.Search(ctx, query.Query, filters, query.Offset, query.Limit)
	if err != nil {
		return nil, err
	}
	
	// Pour la recherche, on peut estimer le total ou faire une requête count séparée
	total := int64(len(listings)) // Estimation simplifiée
	
	return dto.NewListingListDTO(listings, total, query.Offset, query.Limit), nil
}

// HandleGetPromotedListings traite la requête d'annonces promues
func (h *SearchListingsHandler) HandleGetPromotedListings(ctx context.Context, query *GetPromotedListingsQuery) (*dto.ListingListDTO, error) {
	listings, err := h.listingRepo.GetPromoted(ctx, query.Limit)
	if err != nil {
		return nil, err
	}
	
	return dto.NewListingListDTO(listings, int64(len(listings)), 0, query.Limit), nil
}

// HandleGetRecentListings traite la requête d'annonces récentes
func (h *SearchListingsHandler) HandleGetRecentListings(ctx context.Context, query *GetRecentListingsQuery) (*dto.ListingListDTO, error) {
	listings, err := h.listingRepo.GetRecent(ctx, query.Limit)
	if err != nil {
		return nil, err
	}
	
	return dto.NewListingListDTO(listings, int64(len(listings)), 0, query.Limit), nil
}
