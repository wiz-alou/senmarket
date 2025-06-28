// internal/application/queries/get_listings.go
package queries

import (
	"context"
	"senmarket/internal/application/dto"
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/repositories"
)

// GetListingsQuery requête pour récupérer des annonces
type GetListingsQuery struct {
	CategoryID   *string `json:"category_id,omitempty"`
	Region       *string `json:"region,omitempty"`
	PriceMin     *float64 `json:"price_min,omitempty"`
	PriceMax     *float64 `json:"price_max,omitempty"`
	Status       *string `json:"status,omitempty"`
	IsPromoted   *bool   `json:"is_promoted,omitempty"`
	Offset       int     `json:"offset" validate:"min=0"`
	Limit        int     `json:"limit" validate:"min=1,max=100"`
}

// GetListingByIDQuery requête pour récupérer une annonce par ID
type GetListingByIDQuery struct {
	ListingID string `json:"listing_id" validate:"required"`
}

// GetUserListingsQuery requête pour récupérer les annonces d'un utilisateur
type GetUserListingsQuery struct {
	UserID string `json:"user_id" validate:"required"`
	Offset int    `json:"offset" validate:"min=0"`
	Limit  int    `json:"limit" validate:"min=1,max=100"`
}

// GetListingsHandler handler pour récupérer des annonces
type GetListingsHandler struct {
	listingRepo repositories.ListingRepository
}

// NewGetListingsHandler crée un nouveau handler
func NewGetListingsHandler(listingRepo repositories.ListingRepository) *GetListingsHandler {
	return &GetListingsHandler{
		listingRepo: listingRepo,
	}
}

// HandleGetListings traite la requête de récupération d'annonces
func (h *GetListingsHandler) HandleGetListings(ctx context.Context, query *GetListingsQuery) (*dto.ListingListDTO, error) {
	filters := repositories.ListingFilters{
		CategoryID: query.CategoryID,
		Region:     query.Region,
		PriceMin:   query.PriceMin,
		PriceMax:   query.PriceMax,
		Status:     query.Status,
		IsPromoted: query.IsPromoted,
	}
	
	listings, err := h.listingRepo.List(ctx, filters, query.Offset, query.Limit)
	if err != nil {
		return nil, err
	}
	
	total, err := h.listingRepo.Count(ctx, filters)
	if err != nil {
		return nil, err
	}
	
	return dto.NewListingListDTO(listings, total, query.Offset, query.Limit), nil
}

// HandleGetListingByID traite la requête de récupération d'annonce par ID
func (h *GetListingsHandler) HandleGetListingByID(ctx context.Context, query *GetListingByIDQuery) (*dto.ListingDTO, error) {
	listing, err := h.listingRepo.GetByID(ctx, query.ListingID)
	if err != nil {
		return nil, err
	}
	if listing == nil {
		return nil, entities.ErrListingNotFound
	}
	
	return dto.NewListingDTO(listing), nil
}

// HandleGetUserListings traite la requête de récupération d'annonces utilisateur
func (h *GetListingsHandler) HandleGetUserListings(ctx context.Context, query *GetUserListingsQuery) (*dto.ListingListDTO, error) {
	listings, err := h.listingRepo.GetByUserID(ctx, query.UserID, query.Offset, query.Limit)
	if err != nil {
		return nil, err
	}
	
	// Compter le total pour cet utilisateur
	filters := repositories.ListingFilters{
		UserID: &query.UserID,
	}
	total, err := h.listingRepo.Count(ctx, filters)
	if err != nil {
		return nil, err
	}
	
	return dto.NewListingListDTO(listings, total, query.Offset, query.Limit), nil
}
