// internal/domain/entities/category.go
package entities

import (
	"time"
	"strings"
)

// Category représente une catégorie d'annonces
type Category struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Icon        string    `json:"icon"`
	Color       string    `json:"color"`
	ParentID    *string   `json:"parent_id,omitempty"`
	IsActive    bool      `json:"is_active"`
	SortOrder   int       `json:"sort_order"`
	
	// Statistiques
	ListingsCount int64   `json:"listings_count"`
	
	// Métadonnées
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// NewCategory crée une nouvelle catégorie
func NewCategory(name, description, icon, color string, parentID *string) (*Category, error) {
	if strings.TrimSpace(name) == "" {
		return nil, NewDomainError("le nom de la catégorie est obligatoire")
	}
	
	if len(name) > 50 {
		return nil, NewDomainError("le nom ne peut pas dépasser 50 caractères")
	}
	
	if len(description) > 200 {
		return nil, NewDomainError("la description ne peut pas dépasser 200 caractères")
	}
	
	now := time.Now()
	
	return &Category{
		Name:          strings.TrimSpace(name),
		Description:   strings.TrimSpace(description),
		Icon:          icon,
		Color:         color,
		ParentID:      parentID,
		IsActive:      true,
		SortOrder:     0,
		ListingsCount: 0,
		CreatedAt:     now,
		UpdatedAt:     now,
	}, nil
}

// UpdateName met à jour le nom de la catégorie
func (c *Category) UpdateName(name string) error {
	if strings.TrimSpace(name) == "" {
		return NewDomainError("le nom de la catégorie est obligatoire")
	}
	
	if len(name) > 50 {
		return NewDomainError("le nom ne peut pas dépasser 50 caractères")
	}
	
	c.Name = strings.TrimSpace(name)
	c.UpdatedAt = time.Now()
	return nil
}

// UpdateDescription met à jour la description
func (c *Category) UpdateDescription(description string) error {
	if len(description) > 200 {
		return NewDomainError("la description ne peut pas dépasser 200 caractères")
	}
	
	c.Description = strings.TrimSpace(description)
	c.UpdatedAt = time.Now()
	return nil
}

// SetIcon définit l'icône de la catégorie
func (c *Category) SetIcon(icon string) {
	c.Icon = icon
	c.UpdatedAt = time.Now()
}

// SetColor définit la couleur de la catégorie
func (c *Category) SetColor(color string) {
	c.Color = color
	c.UpdatedAt = time.Now()
}

// SetSortOrder définit l'ordre de tri
func (c *Category) SetSortOrder(order int) {
	c.SortOrder = order
	c.UpdatedAt = time.Now()
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

// IncrementListingsCount incrémente le compteur d'annonces
func (c *Category) IncrementListingsCount() {
	c.ListingsCount++
	// On ne met pas à jour UpdatedAt pour les compteurs (performance)
}

// DecrementListingsCount décrémente le compteur d'annonces
func (c *Category) DecrementListingsCount() {
	if c.ListingsCount > 0 {
		c.ListingsCount--
	}
	// On ne met pas à jour UpdatedAt pour les compteurs (performance)
}

// IsSubCategory vérifie si c'est une sous-catégorie
func (c *Category) IsSubCategory() bool {
	return c.ParentID != nil
}
