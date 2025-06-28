// internal/application/queries/get_categories.go
package queries

import (
	"context"
	"senmarket/internal/application/dto"
	"senmarket/internal/domain/entities"
)

// GetCategoriesQuery requête pour récupérer les catégories
type GetCategoriesQuery struct {
	ParentID *string `json:"parent_id,omitempty"`
	IsActive *bool   `json:"is_active,omitempty"`
}

// GetCategoryByIDQuery requête pour récupérer une catégorie par ID
type GetCategoryByIDQuery struct {
	CategoryID string `json:"category_id" validate:"required"`
}

// GetCategoriesHandler handler pour récupérer les catégories
type GetCategoriesHandler struct {
	// Note: On aura besoin d'un CategoryRepository
	// categoryRepo repositories.CategoryRepository
}

// NewGetCategoriesHandler crée un nouveau handler
func NewGetCategoriesHandler() *GetCategoriesHandler {
	return &GetCategoriesHandler{}
}

// HandleGetCategories traite la requête de récupération de catégories
func (h *GetCategoriesHandler) HandleGetCategories(ctx context.Context, query *GetCategoriesQuery) (*dto.CategoryListDTO, error) {
	// TODO: Implémenter quand on aura le CategoryRepository
	// Pour l'instant, retourner une liste vide
	return &dto.CategoryListDTO{
		Categories: []*dto.CategoryDTO{},
		Total:      0,
	}, nil
}

// HandleGetCategoryByID traite la requête de récupération de catégorie par ID
func (h *GetCategoriesHandler) HandleGetCategoryByID(ctx context.Context, query *GetCategoryByIDQuery) (*dto.CategoryDTO, error) {
	// TODO: Implémenter quand on aura le CategoryRepository
	return nil, entities.ErrCategoryNotFound
}
