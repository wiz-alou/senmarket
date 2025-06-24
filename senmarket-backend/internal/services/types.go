// internal/services/types.go
package services

import "senmarket/internal/models"

// ListingResponse structure pour les réponses de listings
type ListingResponse struct {
	Data       []models.Listing `json:"data"`
	Pagination PaginationInfo   `json:"pagination"`
}

// PaginationInfo informations de pagination
type PaginationInfo struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

// CategoryWithStats catégorie avec statistiques
type CategoryWithStats struct {
	models.Category
	ListingCount int64 `json:"listing_count"`
}

// CreateListingRequest structure pour créer une annonce
type CreateListingRequest struct {
	Title       string   `json:"title" validate:"required,min=3,max=100"`
	Description string   `json:"description" validate:"required,min=10,max=1000"`
	Price       float64  `json:"price" validate:"required,min=0"`
	CategoryID  string   `json:"category_id" validate:"required,uuid"`
	Region      string   `json:"region" validate:"required"`
	Images      []string `json:"images" validate:"max=5"`
	Phone       string   `json:"phone" validate:"required"`
	Featured    bool     `json:"featured"`
}

// UpdateListingRequest structure pour mettre à jour une annonce
type UpdateListingRequest struct {
	Title       *string  `json:"title,omitempty"`
	Description *string  `json:"description,omitempty"`
	Price       *float64 `json:"price,omitempty"`
	Region      *string  `json:"region,omitempty"`
	Images      []string `json:"images,omitempty"`
	Phone       *string  `json:"phone,omitempty"`
	Status      *string  `json:"status,omitempty"`
}

// Ajouter ces champs dans ListingQuery
type ListingQuery struct {
	CategoryID string  `form:"category_id" json:"category_id"`
	Region     string  `form:"region" json:"region"`
	MinPrice   float64 `form:"min_price" json:"min_price"`
	MaxPrice   float64 `form:"max_price" json:"max_price"`
	Search     string  `form:"search" json:"search"`
	Sort       string  `form:"sort" json:"sort"`
	Page       int     `form:"page,default=1" json:"page"`
	Limit      int     `form:"limit,default=20" json:"limit"`
	UserID     string  `form:"user_id" json:"user_id"`        // NOUVEAU
	Status     string  `form:"status" json:"status"`          // NOUVEAU
}