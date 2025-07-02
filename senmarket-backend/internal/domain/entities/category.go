// internal/domain/entities/category.go
package entities

import (
	"time"
	"github.com/google/uuid"
)

// Category - Entité catégorie
type Category struct {
	ID          uuid.UUID  `json:"id"`
	Slug        string     `json:"slug"`
	Name        string     `json:"name"`
	Icon        string     `json:"icon"`
	Description *string    `json:"description"`
	IsActive    bool       `json:"is_active"`
	SortOrder   int        `json:"sort_order"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `json:"deleted_at"`
}

// NewCategory crée une nouvelle catégorie
func NewCategory(slug, name, icon string, description *string, sortOrder int) *Category {
	now := time.Now()
	
	return &Category{
		ID:          uuid.New(),
		Slug:        slug,
		Name:        name,
		Icon:        icon,
		Description: description,
		IsActive:    true,
		SortOrder:   sortOrder,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

// IsValid vérifie si la catégorie est valide
func (c *Category) IsValid() error {
	if c.Slug == "" {
		return ErrCategorySlugRequired
	}
	if c.Name == "" {
		return ErrCategoryNameRequired
	}
	if c.Icon == "" {
		return ErrCategoryIconRequired
	}
	return nil
}

// Activate active la catégorie
func (c *Category) Activate() {
	c.IsActive = true
	c.UpdatedAt = time.Now()
}

// Deactivate désactive la catégorie
func (c *Category) Deactivate() {
	c.IsActive = false
	c.UpdatedAt = time.Now()
}

// UpdateSortOrder met à jour l'ordre de tri
func (c *Category) UpdateSortOrder(newOrder int) {
	c.SortOrder = newOrder
	c.UpdatedAt = time.Now()
}

