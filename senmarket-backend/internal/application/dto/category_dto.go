// internal/application/dto/category_dto.go
package dto

import (
	"senmarket/internal/domain/entities"
	"time"
)

// CategoryDTO DTO pour les catégories
type CategoryDTO struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	Description   string    `json:"description"`
	Icon          string    `json:"icon"`
	Color         string    `json:"color"`
	ParentID      *string   `json:"parent_id,omitempty"`
	IsActive      bool      `json:"is_active"`
	SortOrder     int       `json:"sort_order"`
	ListingsCount int64     `json:"listings_count"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// NewCategoryDTO crée un nouveau CategoryDTO depuis une entité Category
func NewCategoryDTO(category *entities.Category) *CategoryDTO {
	return &CategoryDTO{
		ID:            category.ID,
		Name:          category.Name,
		Description:   category.Description,
		Icon:          category.Icon,
		Color:         category.Color,
		ParentID:      category.ParentID,
		IsActive:      category.IsActive,
		SortOrder:     category.SortOrder,
		ListingsCount: category.ListingsCount,
		CreatedAt:     category.CreatedAt,
		UpdatedAt:     category.UpdatedAt,
	}
}

// CategoryListDTO DTO pour une liste de catégories
type CategoryListDTO struct {
	Categories []*CategoryDTO `json:"categories"`
	Total      int64          `json:"total"`
}

// NewCategoryListDTO crée un nouveau CategoryListDTO
func NewCategoryListDTO(categories []*entities.Category) *CategoryListDTO {
	dtos := make([]*CategoryDTO, len(categories))
	for i, category := range categories {
		dtos[i] = NewCategoryDTO(category)
	}
	
	return &CategoryListDTO{
		Categories: dtos,
		Total:      int64(len(categories)),
	}
}

// CategorySummaryDTO DTO pour un résumé de catégorie
type CategorySummaryDTO struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	Icon          string `json:"icon"`
	Color         string `json:"color"`
	ListingsCount int64  `json:"listings_count"`
}

// NewCategorySummaryDTO crée un nouveau CategorySummaryDTO
func NewCategorySummaryDTO(category *entities.Category) *CategorySummaryDTO {
	return &CategorySummaryDTO{
		ID:            category.ID,
		Name:          category.Name,
		Icon:          category.Icon,
		Color:         category.Color,
		ListingsCount: category.ListingsCount,
	}
}
