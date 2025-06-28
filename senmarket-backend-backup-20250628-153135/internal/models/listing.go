// internal/models/listing.go
package models

import (
	"time"
	"github.com/lib/pq"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Listing struct {
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID      uuid.UUID      `json:"user_id" gorm:"type:uuid;not null;index"`
	CategoryID  uuid.UUID      `json:"category_id" gorm:"type:uuid;not null;index"`
	Title       string         `json:"title" gorm:"not null" validate:"required,min=5,max=200"`
	Description string         `json:"description" gorm:"type:text;not null" validate:"required,min=20"`
	Price       float64        `json:"price" gorm:"type:decimal(12,2);not null" validate:"required,min=0"`
	Currency    string         `json:"currency" gorm:"default:'XOF'"`
	Region      string         `json:"region" gorm:"not null" validate:"required"`
	Images      pq.StringArray `json:"images" gorm:"type:text[]"`
	Status      string         `json:"status" gorm:"default:'draft'" validate:"oneof=draft active sold expired"`
	ViewsCount  int            `json:"views_count" gorm:"default:0"`
	IsFeatured  bool           `json:"is_featured" gorm:"default:false"`
	ExpiresAt   *time.Time     `json:"expires_at"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
	
	// Relations
	User     User     `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Category Category `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
	Payments []Payment `json:"payments,omitempty" gorm:"foreignKey:ListingID"`
}

// BeforeCreate hook
func (l *Listing) BeforeCreate(tx *gorm.DB) error {
	if l.ID == uuid.Nil {
		l.ID = uuid.New()
	}
	
	// Set expiration date (30 days from now)
	if l.ExpiresAt == nil {
		expiresAt := time.Now().AddDate(0, 0, 30)
		l.ExpiresAt = &expiresAt
	}
	
	return nil
}

// BeforeUpdate hook
func (l *Listing) BeforeUpdate(tx *gorm.DB) error {
	// Auto-expire if past expiration date
	if l.ExpiresAt != nil && time.Now().After(*l.ExpiresAt) && l.Status == "active" {
		l.Status = "expired"
	}
	return nil
}

// TableName override
func (Listing) TableName() string {
	return "listings"
}

// IsActive vérifie si l'annonce est active
func (l *Listing) IsActive() bool {
	return l.Status == "active" && 
		   l.DeletedAt.Time.IsZero() &&
		   (l.ExpiresAt == nil || time.Now().Before(*l.ExpiresAt))
}

// IncrementViews augmente le compteur de vues
func (l *Listing) IncrementViews(db *gorm.DB) error {
	return db.Model(l).Update("views_count", gorm.Expr("views_count + 1")).Error
}

// GetMainImage retourne la première image ou une image par défaut
func (l *Listing) GetMainImage() string {
	if len(l.Images) > 0 {
		return l.Images[0]
	}
	return "/assets/no-image.jpg"
}