// internal/models/contact.go
package models

import (
	"time"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Contact struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ListingID uuid.UUID      `json:"listing_id" gorm:"type:uuid;not null;index"`
	SenderID  *uuid.UUID     `json:"sender_id" gorm:"type:uuid;index"` // Optionnel si visiteur non connecté
	Name      string         `json:"name" gorm:"not null" validate:"required,min=2"`
	Phone     string         `json:"phone" gorm:"not null" validate:"required"`
	Email     string         `json:"email" validate:"email"`
	Message   string         `json:"message" gorm:"type:text;not null" validate:"required,min=10"`
	IsRead    bool           `json:"is_read" gorm:"default:false"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
	
	// Relations
	Listing Listing `json:"listing,omitempty" gorm:"foreignKey:ListingID"`
	Sender  *User   `json:"sender,omitempty" gorm:"foreignKey:SenderID"`
}

func (c *Contact) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}

func (Contact) TableName() string {
	return "contacts"
}