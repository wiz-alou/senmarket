// internal/models/category.go
package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Category struct {
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Slug        string         `json:"slug" gorm:"uniqueIndex;not null"`
	Name        string         `json:"name" gorm:"not null"`
	Icon        string         `json:"icon" gorm:"not null"`
	Description string         `json:"description"`
	IsActive    bool           `json:"is_active" gorm:"default:true"`
	SortOrder   int            `json:"sort_order" gorm:"default:0"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
	
	// Relations
	Listings []Listing `json:"listings,omitempty" gorm:"foreignKey:CategoryID"`
}

// BeforeCreate hook
func (c *Category) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}

// TableName override
func (Category) TableName() string {
	return "categories"
}

// GetListingCount retourne le nombre d'annonces
func (c *Category) GetListingCount(db *gorm.DB) int64 {
	var count int64
	db.Model(&Listing{}).Where("category_id = ? AND status = ?", c.ID, "active").Count(&count)
	return count
}